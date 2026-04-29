import { useMemo } from 'react';
import { ChatStatus } from '@/types/consultation';

/**
 * Consultation lifecycle phases derived from ChatStatus + time.
 *
 *   PRE_VISIT    – Before appointment; patient can leave memo notes.
 *   IN_PROGRESS  – During the consultation slot; full 2-way chat + video.
 *   COMPLETED    – Doctor clicked "Complete"; chat archived and read-only.
 */
export type ConsultationPhase = 'PRE_VISIT' | 'IN_PROGRESS' | 'COMPLETED';

export interface ConsultationPhaseInfo {
  phase: ConsultationPhase;
  /** Whether the chat input should be enabled (either side). */
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
      description: 'Consultation completed. Chat is read-only.',
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

  // ChatStatus.Open — IN_PROGRESS
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
