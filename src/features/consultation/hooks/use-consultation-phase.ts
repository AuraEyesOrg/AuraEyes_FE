import { useMemo } from 'react';
import { ChatStatus } from '@/types/consultation';

/**
 * Consultation lifecycle phases derived from ChatStatus + time.
 *
 *   PRE_VISIT    – Before appointment; patient can leave memo notes.
 *   IN_PROGRESS  – During the consultation slot; full 2-way chat + video.
 *   POST_VISIT   – Grace window after slot ends; chat still open for Rx / notes.
 *   COMPLETED    – Chat archived and read-only.
 */
export type ConsultationPhase =
  | 'PRE_VISIT'
  | 'IN_PROGRESS'
  | 'POST_VISIT'
  | 'COMPLETED';

/** Duration of the consultation slot in milliseconds. */
const SLOT_DURATION_MS = 60 * 60 * 1000; // 60 min

export interface ConsultationPhaseInfo {
  phase: ConsultationPhase;
  /** Whether the chat input should be enabled. */
  canSend: boolean;
  /** Whether the patient side can send messages. */
  patientCanSend: boolean;
  /** Whether the doctor side can send messages. */
  doctorCanSend: boolean;
  /** Whether the Google Meet join button should be active. */
  meetingActive: boolean;
  /** Human-readable label for the current phase. */
  label: string;
  /** Short description shown to the user. */
  description: string;
  /** ms until the next state transition (null if no auto-transition). */
  msUntilNextTransition: number | null;
}

export function deriveConsultationPhase(
  chatStatus: ChatStatus,
  appointmentTime: string | null,
  nowMs: number
): ConsultationPhaseInfo {
  if (chatStatus === ChatStatus.Locked) {
    return {
      phase: 'PRE_VISIT',
      canSend: false,
      patientCanSend: false,
      doctorCanSend: false,
      meetingActive: false,
      label: 'Locked',
      description: 'Chat is locked. Waiting for doctor verification.',
      msUntilNextTransition: null,
    };
  }

  if (chatStatus === ChatStatus.Archived) {
    return {
      phase: 'COMPLETED',
      canSend: false,
      patientCanSend: false,
      doctorCanSend: false,
      meetingActive: false,
      label: 'Completed',
      description: 'Consultation has been completed. Chat is now read-only.',
      msUntilNextTransition: null,
    };
  }

  if (chatStatus === ChatStatus.MemoOnly) {
    const msUntilOpen = appointmentTime
      ? new Date(appointmentTime).getTime() - nowMs
      : null;

    return {
      phase: 'PRE_VISIT',
      canSend: true,
      patientCanSend: true,
      doctorCanSend: false,
      meetingActive: false,
      label: 'Pre-visit',
      description:
        'Share symptoms, scan notes, or questions before the consultation starts. The doctor will review them at appointment time.',
      msUntilNextTransition:
        msUntilOpen !== null && msUntilOpen > 0 ? msUntilOpen : null,
    };
  }

  // ChatStatus.Open — determine IN_PROGRESS vs POST_VISIT
  if (!appointmentTime) {
    return {
      phase: 'IN_PROGRESS',
      canSend: true,
      patientCanSend: true,
      doctorCanSend: true,
      meetingActive: true,
      label: 'In Progress',
      description:
        'Consultation is active. You can chat and join the video call.',
      msUntilNextTransition: null,
    };
  }

  const appointmentMs = new Date(appointmentTime).getTime();
  const slotEndMs = appointmentMs + SLOT_DURATION_MS;

  if (nowMs < slotEndMs) {
    return {
      phase: 'IN_PROGRESS',
      canSend: true,
      patientCanSend: true,
      doctorCanSend: true,
      meetingActive: true,
      label: 'In Progress',
      description:
        'Consultation is active. You can chat and join the video call.',
      msUntilNextTransition: slotEndMs - nowMs,
    };
  }

  // Past slot end → POST_VISIT (grace period)
  return {
    phase: 'POST_VISIT',
    canSend: true,
    patientCanSend: true,
    doctorCanSend: true,
    meetingActive: false,
    label: 'Post-visit',
    description:
      'The video slot has ended. Chat remains open for follow-up notes and prescriptions.',
    msUntilNextTransition: null,
  };
}

/**
 * React hook that derives the consultation phase from session data + current time.
 * Re-computes whenever chatStatus, appointmentTime, or nowMs changes.
 */
export function useConsultationPhase(
  chatStatus: ChatStatus | undefined,
  appointmentTime: string | null,
  nowMs: number
): ConsultationPhaseInfo {
  return useMemo(
    () =>
      deriveConsultationPhase(
        chatStatus ?? ChatStatus.Locked,
        appointmentTime,
        nowMs
      ),
    [chatStatus, appointmentTime, nowMs]
  );
}
