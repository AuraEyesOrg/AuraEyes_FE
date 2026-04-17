import 'i18next';

declare module 'i18next' {
  interface TranslationSchema {
    Validation: {
      Required: string;
      MaxLength: {
        FullName: string;
        Phone: string;
        Address: string;
        CitizenId: string;
      };
      MinLength: {
        Password: string;
      };
      Invalid: {
        Gender: string;
        CitizenId: string;
      };
      Password: {
        MustBeDifferent: string;
        Mismatch: string;
      };
    };
    Navigation: {
      home: string;
      about: string;
      howItWorks: string;
      ethicsPrivacy: string;
      contact: string;
      status: string;
      compliance: string;
    };
    Common: {
      getStarted: string;
      bookAppointment: string;
      findDoctor: string;
      learnMore: string;
      helpTour: string;
      language: string;
      toggleMenu: string;
      switchToDark: string;
      switchToLight: string;
      sidebar: {
        auraNetwork: string;
      };
    };
    GuestFooter: {
      platform: string;
      services: string;
      reserved: string;
      privacy: string;
      terms: string;
      personalData: string;
      security: string;
      facebookAriaLabel: string;
    };
    GuestLegal: {
      privacy: {
        header: {
          title: string;
          subtitle: string;
          lastUpdated: string;
        };
        intro: {
          complianceLabel: string;
          complianceDescription: string;
          commitment: string;
        };
        sections: {
          classification: {
            title: string;
            description: string;
            cards: {
              pii: {
                title: string;
                description: string;
              };
              phi: {
                title: string;
                description: string;
              };
              professional: {
                title: string;
                description: string;
              };
              financial: {
                title: string;
                description: string;
              };
            };
          };
          usage: {
            title: string;
            items: {
              coreOperations: {
                title: string;
                description: string;
              };
              medicalCoordination: {
                title: string;
                description: string;
              };
              aiTraining: {
                title: string;
                description: string;
              };
              communication: {
                title: string;
                description: string;
              };
            };
          };
          commitments: {
            title: string;
            items: {
              noCommercialization: {
                title: string;
                descriptionPrefix: string;
                highlight: string;
                descriptionSuffix: string;
              };
              storageStandards: {
                title: string;
                description: string;
              };
              dataSubjectRights: {
                title: string;
                description: string;
              };
            };
          };
        };
      };
      personalData: {
        header: {
          title: string;
          subtitle: string;
          lastUpdated: string;
        };
        intro: {
          referenceLabel: string;
          referenceDescription: string;
          commitment: string;
        };
        sections: {
          rights: {
            title: string;
            description: string;
            items: {
              access: {
                title: string;
                description: string;
              };
              rectification: {
                title: string;
                description: string;
              };
              erasure: {
                title: string;
                description: string;
              };
              withdrawConsent: {
                title: string;
                description: string;
              };
            };
          };
          retention: {
            title: string;
            cards: {
              active: {
                title: string;
                description: string;
              };
              deleted: {
                title: string;
                description: string;
              };
              legalFinancial: {
                title: string;
                description: string;
              };
            };
          };
          breach: {
            title: string;
            description: string;
            items: {
              incidentResponse: string;
              notifyAffectedUsers: string;
            };
          };
        };
      };
      security: {
        header: {
          title: string;
          subtitle: string;
          lastUpdated: string;
        };
        intro: {
          title: string;
          description: string;
        };
        sections: {
          encryption: {
            title: string;
            description: string;
            cards: {
              dataAtRest: {
                title: string;
                description: string;
              };
              dataInTransit: {
                title: string;
                description: string;
              };
            };
          };
          accessControl: {
            title: string;
            items: {
              rbac: {
                title: string;
                description: string;
              };
              mfa: {
                title: string;
                description: string;
              };
              sessionManagement: {
                title: string;
                description: string;
              };
            };
          };
          infrastructure: {
            title: string;
            items: {
              certifications: {
                label: string;
                description: string;
              };
              waf: {
                label: string;
                description: string;
              };
              isolation: {
                label: string;
                description: string;
              };
            };
          };
          monitoring: {
            title: string;
            items: {
              auditLogs: {
                title: string;
                description: string;
              };
              continuousMonitoring: {
                title: string;
                description: string;
              };
            };
          };
        };
      };
      terms: {
        header: {
          title: string;
          subtitle: string;
          lastUpdated: string;
          version: string;
        };
        intro: {
          welcome: string;
          description: string;
        };
        sections: {
          serviceNature: {
            title: string;
            description: string;
            disclaimer: {
              title: string;
              descriptionPrefix: string;
              highlight: string;
              descriptionSuffix: string;
            };
          };
          userResponsibilities: {
            title: string;
            cards: {
              patient: {
                title: string;
                description: string;
              };
              medicalProfessional: {
                title: string;
                description: string;
              };
            };
          };
          payment: {
            title: string;
            items: {
              paymentGateway: {
                title: string;
                description: string;
              };
              financialTransparency: {
                title: string;
                description: string;
              };
              withdrawalPolicy: {
                title: string;
                description: string;
              };
            };
          };
          intellectualProperty: {
            title: string;
            description: string;
            notice: string;
          };
        };
      };
    };
    GuestTour: {
      controls: {
        back: string;
        close: string;
        last: string;
        next: string;
        skip: string;
      };
      steps: {
        logo: string;
        navAbout: string;
        navHowItWorks: string;
        aboutMission: string;
        contactOrganisation: string;
        getStartedPatient: string;
        getStartedDoctor: string;
      };
    };
    Auth: {
      login: string;
      register: string;
      forgotPassword: string;
    };
    AuthPages: {
      shared: {
        copyright: string;
        backToLogin: string;
        termsOfService: string;
        privacyPolicy: string;
      };
      login: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          hipaa: string;
          encryption: string;
          systemStatus: string;
          online: string;
        };
        tabs: {
          login: string;
          register: string;
        };
        messages: {
          dismiss: string;
          orContinueWith: string;
          registrationSuccess: string;
          loginFailed: string;
          googleFailed: string;
          googleNoCredential: string;
          loginError: string;
          registrationError: string;
          googleError: string;
          recaptchaRequired: string;
        };
        loginForm: {
          heading: string;
          description: string;
          backHome: string;
          emailLabel: string;
          emailPlaceholder: string;
          passwordLabel: string;
          passwordPlaceholder: string;
          forgotPassword: string;
          signIn: string;
          signingIn: string;
          securityNote: string;
        };
        registerForm: {
          heading: string;
          description: string;
          fullNameLabel: string;
          fullNamePlaceholder: string;
          emailLabel: string;
          emailPlaceholder: string;
          phoneLabel: string;
          phonePlaceholder: string;
          passwordLabel: string;
          passwordPlaceholder: string;
          confirmPasswordLabel: string;
          confirmPasswordPlaceholder: string;
          agreePrefix: string;
          and: string;
          createAccount: string;
          creatingAccount: string;
          doctorCardTitle: string;
          doctorCardDescription: string;
          registerDoctor: string;
          securityNote: string;
        };
        validation: {
          emailRequired: string;
          invalidEmail: string;
          passwordRequired: string;
          passwordMin: string;
          passwordPattern: string;
          fullNameRequired: string;
          fullNameMin: string;
          phoneRequired: string;
          invalidPhone: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
          agreeTerms: string;
        };
      };
      forgotPassword: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          securityFirst: string;
          protectedRecovery: string;
        };
        form: {
          heading: string;
          description: string;
          emailLabel: string;
          emailPlaceholder: string;
          submit: string;
          submitting: string;
        };
        messages: {
          success: string;
          fallbackError: string;
          securityNote: string;
        };
        validation: {
          emailRequired: string;
          invalidEmail: string;
        };
      };
      resetPassword: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          protectedAccount: string;
          strongCredentials: string;
        };
        form: {
          heading: string;
          description: string;
          newPassword: string;
          confirmNewPassword: string;
          submit: string;
          submitting: string;
        };
        messages: {
          invalidLink: string;
          success: string;
          failed: string;
          missingToken: string;
          goToSignIn: string;
          securityNote: string;
        };
        validation: {
          passwordRequired: string;
          passwordMin: string;
          passwordPattern: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
        };
      };
      confirmEmail: {
        verifying: {
          title: string;
          description: string;
        };
        success: {
          title: string;
          description: string;
          cta: string;
        };
        error: {
          defaultMessage: string;
          title: string;
          resend: string;
        };
        resend: {
          title: string;
          description: string;
          emailLabel: string;
          emailPlaceholder: string;
          button: string;
          successTitle: string;
          successDescription: string;
        };
      };
      pendingApproval: {
        brandSubtitle: string;
        brandDescription: string;
        statusBadge: string;
        title: string;
        primaryMessage: string;
        secondaryMessage: string;
        processingTime: string;
        closing: string;
        infoBox: string;
        goHome: string;
        logout: string;
        footer: string;
      };
    };
    Ophthalmologist: {
      common: {
        doctor: string;
        role: string;
        logout: string;
        cancel: string;
        back: string;
        email: string;
        next: string;
        of: string;
        other: string;
        page: string;
        previous: string;
        refresh: string;
        retry: string;
        saving: string;
        severity: {
          mild: string;
          severe: string;
          critical: string;
          moderate: string;
        };
        showing: string;
        status: {
          draft: string;
          finalized: string;
          reviewed: string;
        };
        submitting: string;
        view: string;
        confirm: string;
        fullName: string;
        loading: string;
        nextPage: string;
        notAvailable: string;
        previousPage: string;
        submitRequest: string;
      };
      header: {
        pages: string;
        searchPlaceholder: string;
        toggleTheme: string;
      };
      sidebar: {
        dashboard: string;
        patients: string;
        screenings: string;
        appointments: string;
        schedules: string;
        leaveRequests: string;
        employmentTypeChangeRequests: string;
        consultations: string;
        contract: string;
        settings: string;
        wallet: string;
      };
      leaveRequests: {
        pageTitle: string;
        submitTitle: string;
        submitDescription: string;
        startDate: string;
        endDate: string;
        reason: string;
        reasonPlaceholder: string;
        submitAction: string;
        historyTitle: string;
        empty: string;
        submittedAt: string;
        adminNote: string;
        confirmCancel: string;
        cancelAction: string;
        status: {
          all: string;
          pending: string;
          approved: string;
          rejected: string;
          cancelled: string;
        };
        toast: {
          createSuccess: string;
          createFailed: string;
          cancelSuccess: string;
          cancelFailed: string;
          missingFields: string;
          invalidDateRange: string;
        };
      };
      employmentTypeChangeRequests: {
        pageTitle: string;
        submitTitle: string;
        submitDescription: string;
        currentType: string;
        targetType: string;
        reason: string;
        reasonPlaceholder: string;
        submitAction: string;
        historyTitle: string;
        empty: string;
        createdAt: string;
        reviewedAt: string;
        adminNote: string;
        confirmCancel: string;
        cancelAction: string;
        status: {
          all: string;
          pending: string;
          approved: string;
          rejected: string;
          cancelled: string;
        };
        toast: {
          createSuccess: string;
          createFailed: string;
          cancelSuccess: string;
          cancelFailed: string;
          missingReason: string;
          sameType: string;
        };
      };
      dashboard: {
        greeting: {
          morning: string;
          afternoon: string;
          evening: string;
        };
        loading: string;
        loadError: string;
        organisationLabel: string;
        defaultOrganisation: string;
        subtitle: string;
        reviewQueue: {
          title: string;
          description: string;
          pendingReviews: string;
          urgentCases: string;
        };
        capacity: {
          title: string;
          description: string;
          completedToday: string;
          openSlotsToday: string;
        };
        operationalSummary: {
          title: string;
          description: string;
        };
        priorityList: {
          confidence: string;
          description: string;
          empty: string;
          noSchedule: string;
          patient: string;
          schedule: string;
          sessionId: string;
          title: string;
          viewAll: string;
        };
      };
      settings: {
        defaults: {
          unknownDoctor: string;
          noBio: string;
        };
        pageTitle: string;
        profile: {
          title: string;
          edit: string;
          loading: string;
          verifiedPractitioner: string;
          memberSince: string;
          email: string;
          phone: string;
          experience: string;
          experienceSuffix: string;
          years: string;
          specialty: string;
          employmentType: string;
          employmentTypeValues: {
            fullTime: string;
            partTime: string;
          };
          hospital: string;
          address: string;
          bio: string;
        };
        credentials: {
          title: string;
          upload: string;
          degrees: string;
          licenses: string;
          issuedBy: string;
          issued: string;
          expires: string;
          noDegrees: string;
          noLicenses: string;
          addNow: string;
          status: {
            verified: string;
            pending: string;
            expired: string;
          };
        };
        wallet: {
          title: string;
          availableBalance: string;
          withdrawFunds: string;
          recentTransactions: string;
          loadingTransactions: string;
          noTransactions: string;
          viewAllTransactions: string;
          withdrawalAmount: string;
          minimumWithdrawal: string;
          withdrawalTo: string;
          withdraw: string;
        };
        accountSettings: {
          title: string;
          security: string;
          securityHint: string;
          securityHintChecking: string;
          securityHintEnabled: string;
          securityHintDisabled: string;
          resetPassword: string;
          resetPasswordHint: string;
          currentPassword: string;
          newPassword: string;
          confirmNewPassword: string;
          updatePassword: string;
          passwordChanged: string;
          passwordChangeFailed: string;
          language: string;
          languageVi: string;
          languageEn: string;
        };
        appearance: {
          title: string;
          darkMode: string;
          currentlyOn: string;
          currentlyOff: string;
        };
        notifications: {
          title: string;
          email: string;
          emailHint: string;
          push: string;
          pushHint: string;
          reminders: string;
          remindersHint: string;
        };
        dangerZone: {
          title: string;
          deactivate: string;
          description: string;
        };
        editModal: {
          bioDescription: string;
          fullName: string;
          phoneNumber: string;
          saveChanges: string;
          title: string;
        };
        toast: {
          avatarUploaded: string;
          avatarUploadFailed: string;
          fullNameRequired: string;
          profileUpdated: string;
          profileUpdateFailed: string;
        };
        validation: {
          avatarFileSize: string;
          avatarFileType: string;
        };
      };
      appointments: {
        title: string;
        subtitle: string;
        loading: string;
        manageSlots: string;
        notScheduled: string;
        invalidDate: string;
        unknownPatient: string;
        onlineConsultation: string;
        inPersonConsultation: string;
        open: string;
        view: string;
        searchPlaceholder: string;
        filterLabel: string;
        filter: {
          all: string;
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
        status: {
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
        stats: {
          today: string;
          upcoming: string;
          completed: string;
          cancelled: string;
        };
        emptyTitle: string;
        emptyAll: string;
        emptyPrefix: string;
        emptySuffix: string;
        toast: {
          missingDoctorIdentity: string;
          cancelReason: string;
          cancelSuccess: string;
          cancelError: string;
        };
        tab: {
          cancelled: string;
          past: string;
          today: string;
          upcoming: string;
        };
        countdown: {
          daysShort: string;
          hoursShort: string;
          in: string;
          minutesShort: string;
          startsIn: string;
        };
        emptySearch: string;
        emptyTab: string;
        joinCall: string;
        now: string;
        openPatientConversation: string;
        todayTimeline: string;
      };
      schedules: {
        title: string;
        subtitle: string;
        loading: string;
        addSlot: string;
        today: string;
        noSlots: string;
        cancelSlotTitle: string;
        errorCreateSlot: string;
        stats: {
          thisWeek: string;
          available: string;
          booked: string;
          cancelled: string;
          blocked: string;
          totalSlots: string;
        };
        filter: {
          all: string;
          available: string;
          booked: string;
          past: string;
        };
        modal: {
          title: string;
          date: string;
          startTime: string;
          endTime: string;
          slotType: string;
          costOptional: string;
          createSlot: string;
        };
        toast: {
          cancelError: string;
          cancelSuccess: string;
          createSuccess: string;
        };
        validation: {
          invalidCost: string;
          invalidRange: string;
          missingDateTime: string;
        };
      };
      consultations: {
        title: string;
        chat: {
          patient: string;
          doctor: string;
          you: string;
          loading: string;
          searchPlaceholder: string;
          stats: {
            all: string;
            open: string;
            upcoming: string;
          };
          emptySearchTitle: string;
          emptySearchSubtitle: string;
          joinMeeting: string;
          joinLocked: string;
          joinAvailableAfter: string;
          canJoinBeforePrefix: string;
          minutes: string;
          meetingEnded: string;
          meetingWindowClosed: string;
          meetingLinkReady: string;
          linkPending: string;
          schedulePending: string;
          confirmCancelSession: string;
          confirmCompleteSession: string;
          cancelReason: string;
          sendError: string;
          complete: string;
          hideSessionOverview: string;
          showSessionOverview: string;
          autoOpenAtSchedule: string;
          opensIn: string;
          savedAsDoctorNote: string;
          deliveredToPatient: string;
          patientPreVisitNote: string;
          patientMessage: string;
          reviewPatientNotes: string;
          noMessagesInSession: string;
          noMessagesYet: string;
          preVisitEmptyDescription: string;
          inProgressEmptyDescription: string;
          completedEmptyDescription: string;
          typeMessage: string;
          encryptionNotice: string;
          characters: string;
          completedReadOnly: string;
          preVisitReadOnly: string;
          selectSession: string;
          selectSessionDescription: string;
          sessionOverview: string;
          appointment: string;
          lastActivity: string;
          consultationFee: string;
          phaseLabel: string;
          conversationGuidance: string;
          guidanceDescription: string;
          phase: {
            preVisit: string;
            inProgress: string;
            completed: string;
            locked: string;
            postVisit: string;
            preVisitDescription: string;
            inProgressDescription: string;
            completedDescription: string;
          };
          shareCase: {
            aiConfidence: string;
            doctorSays: string;
            finalDiagnosis: string;
            patient: string;
            riskLevel: string;
            summary: string;
            contentPlaceholder: string;
            description: string;
            doctorContent: string;
            notEligible: string;
            preview: string;
            previewTitle: string;
            retinalImages: string;
            sharing: string;
            success: string;
            title: string;
          };
          aiAnnotated: string;
          aiCaseSnapshot: string;
          cancelSessionTitle: string;
          characterLimitReached: string;
          closeSessionOverview: string;
          completeConsultationTitle: string;
          completedPlaceholder: string;
          confidence: string;
          encryptionNoticeShort: string;
          imageAttached: string;
          invalidSchedule: string;
          join: string;
          na: string;
          noOriginalImage: string;
          original: string;
          originalRetinalImage: string;
          patientTyping: string;
          pendingImage: string;
          previewCompletedEmpty: string;
          previewImageAttachment: string;
          previewLocked: string;
          previewNewMessage: string;
          previewPreVisitEmpty: string;
          previewScanAttachment: string;
          previewUnavailable: string;
          preVisitPlaceholder: string;
          readyToShareImage: string;
          risk: string;
          saveResult: {
            aiSummary: string;
            doctorSays: string;
            finalDiagnosis: string;
          };
          sharedImage: string;
          unknown: string;
          unreadActivity: string;
        };
      };
      patients: {
        title: string;
        subtitle: string;
        loading: string;
        patientPrefix: string;
        notAvailable: string;
        searchPlaceholder: string;
        moreFilters: string;
        empty: string;
        sessionsSuffix: string;
        nextAppointment: string;
        lastCompletedVisit: string;
        upcoming: string;
        completed: string;
        viewDetails: string;
        statusLabel: {
          urgent: string;
          active: string;
          past: string;
        };
        filter: {
          allStatus: string;
          active: string;
          urgent: string;
          pastOnly: string;
        };
        stats: {
          totalPatients: string;
          active: string;
          urgent: string;
          pastOnly: string;
        };
        emptyTitle: string;
        message: string;
        chart: {
          oneMonthAgo: string;
          thisMonth: string;
          twoMonthsAgo: string;
        };
        emptySearch: string;
        lastDiagnosis: string;
      };
      slotManagement: {
        title: string;
        subtitle: string;
        loading: string;
        newTemplate: string;
        noSlots: string;
        notConfigured: string;
        minutes: string;
        create: string;
        creating: string;
        generate: string;
        generating: string;
        blockReason: string;
        fullTimeNotice: string;
        partTimeNotice: string;
        subtitleFullTime: string;
        subtitlePartTime: string;
        fullTimeManualCreateBlocked: string;
        fullTimeManualGenerateBlocked: string;
        fullTimeDeleteTemplateBlocked: string;
        confirmDeleteTemplate: string;
        confirmDeleteTemplateMessage: string;
        confirmDeleteTemplateAction: string;
        blockThisSlot: string;
        unblockThisSlot: string;
        stats: {
          totalSlots: string;
          available: string;
          booked: string;
          blocked: string;
        };
        templates: {
          title: string;
          generateSlots: string;
          empty: string;
        };
        legend: {
          available: string;
          reserved: string;
          booked: string;
          blocked: string;
          expired: string;
        };
        modal: {
          createTemplateTitle: string;
          dayOfWeek: string;
          startTime: string;
          endTime: string;
          slotDuration: string;
          slotType: string;
          costVnd: string;
          generateTitle: string;
          generateFromTemplatePrefix: string;
          fromDate: string;
          toDate: string;
        };
        messages: {
          slotBlocked: string;
          slotUnblocked: string;
          templateCreated: string;
          templateDeleted: string;
          generatedPrefix: string;
          generatedSuffix: string;
        };
        errors: {
          onlyOwnBlock: string;
          onlyOwnUnblock: string;
          failedBlock: string;
          failedUnblock: string;
          failedCreateTemplate: string;
          missingGenerateInputs: string;
          failedGenerate: string;
          failedDeleteTemplate: string;
        };
        pricing: {
          allowedRangeHint: string;
          allowedRangeLabel: string;
          costRequired: string;
          experienceLabel: string;
          outOfRange: string;
          positiveIntegerOnly: string;
          rangeLoadFailed: string;
          rangeLoading: string;
          suggestedHint: string;
        };
      };
      contract: {
        title: string;
        subtitle: string;
        refresh: string;
        loading: string;
        emptyTitle: string;
        emptyDescription: string;
        contractCode: string;
        signedDate: string;
        contractInfo: string;
        template: string;
        type: string;
        ophthalmologistType: string;
        createdDate: string;
        signer: string;
        fullName: string;
        actions: string;
        viewTemplate: string;
        viewTemplateHint: string;
        downloadTemplate: string;
        downloadTemplateHint: string;
        downloadFailed: string;
        activeTitle: string;
        activeDescription: string;
        redirectCountdown: string;
        status: {
          uploadedPendingApproval: string;
          pendingSignature: string;
          active: string;
          draft: string;
        };
        upload: {
          signedContract: string;
          pdfUploaded: string;
          waitingAdmin: string;
          sentNotice: string;
          openOriginal: string;
          reupload: string;
          cancelReupload: string;
          dropzoneLabel: string;
          selectFile: string;
          dropzoneHint: string;
          preview: string;
          uploadSignedContract: string;
          uploadFailed: string;
          invalidType: string;
          fileTooLarge: string;
          uploadSignedTitle: string;
          uploadSignedDescription: string;
          steps: {
            downloadPrint: string;
            signStamp: string;
            captureUpload: string;
          };
          uploadSuccess: string;
        };
        commission: string;
        actualSalary: string;
        pendingDeal: string;
      };
      screeningReview: {
        note: string;
        aiDisclaimer: string;
        aiModel: string;
        attentionNeeded: string;
        backToScreenings: string;
        boundingboxLabel: string;
        captured: string;
        demographics: string;
        detectedFindings: string;
        device: string;
        generateReport: string;
        imageDetails: string;
        invalidIdentifier: string;
        loadFailed: string;
        loading: string;
        magnification: string;
        medicalConditions: string;
        medicalConditionsHint: string;
        modal: {
          aiSummary: string;
          clinicalFindings: string;
          clinicalFindingsHint: string;
          clinicalFindingsPlaceholder: string;
          completeDiagnosis: string;
          confidence: string;
          confirmAndSave: string;
          description: string;
          diagnosisCode: string;
          diagnosisCore: string;
          exportingPdf: string;
          exportPdf: string;
          followUpDate: string;
          linkingSession: string;
          noAiSummary: string;
          recommendations: string;
          referralHint: string;
          referralRequired: string;
          riskLevel: string;
          selectRecommendationTemplate: string;
          selectTreatmentTemplate: string;
          severityLevel: string;
          treatmentAdvice: string;
          treatmentPlan: string;
          urgentCase: string;
          urgentCaseHint: string;
        };
        modalityColorFundus: string;
        noSelectedFundusImage: string;
        noStructuredFindings: string;
        notFound: string;
        original: string;
        overlayEditHint: string;
        previousScans: string;
        previousScansHint: string;
        quality: string;
        qualityGood: string;
        qualityOptimal: string;
        qualityPoor: string;
        qualityUnknown: string;
        referral: {
          monitor: string;
          recommended: string;
          routine: string;
        };
        risk: {
          critical: string;
          high: string;
          low: string;
          moderate: string;
          none: string;
        };
        saveButton: string;
        screeningAi: string;
        selectImageForDetails: string;
        sessionLinkLoading: string;
        share: {
          failed: string;
          header: string;
          noImages: string;
          selectImageTitle: string;
          sendSelected: string;
          success: string;
        };
        shareButton: string;
        status: {
          finalizedLocked: string;
        };
        subtitle: string;
        tabs: {
          currentExam: string;
          medicalHistory: string;
          patientSummary: string;
          previousReports: string;
        };
        title: string;
        toast: {
          downloadReportError: string;
          downloadReportSuccess: string;
          saveFailed: string;
          saveSuccess: string;
        };
        toolbar: {
          addNewBox: string;
          deleteBox: string;
          editOverlay: string;
          exitOverlayEdit: string;
          fullscreen: string;
          measure: string;
          pan: string;
          reset: string;
          resetAiBoxes: string;
          undo: string;
          zoomIn: string;
          zoomOut: string;
        };
        validation: {
          invalidLinkedSession: string;
          missingDoctorIdentity: string;
          noLinkedSession: string;
          requiredDiagnosisAndFindings: string;
        };
      };
      screenings: {
        confidence: {
          high: string;
          low: string;
          moderate: string;
          na: string;
        };
        filter: {
          all: string;
          approved: string;
          flagged: string;
          pending: string;
          reviewed: string;
        };
        images: string;
        pendingAnalysis: string;
        review: string;
        risk: {
          high: string;
          low: string;
          medium: string;
          unknown: string;
        };
        sort: {
          byDate: string;
          byPriority: string;
        };
        stats: {
          approved: string;
          flagged: string;
          pending: string;
          total: string;
        };
        status: {
          approved: string;
          flagged: string;
          rejected: string;
          reviewed: string;
          pendingReview: string;
        };
        title: string;
        aiPrediction: string;
        consultationDate: string;
        createdDate: string;
        empty: {
          default: string;
          filtered: string;
          title: string;
        };
        loadError: string;
        loading: string;
        needsAttention: string;
        openChat: string;
        reviewNow: string;
        searchPlaceholder: string;
        subtitle: string;
        toggleSortOrder: string;
      };
      wallet: {
        balance: string;
        loading: string;
        title: string;
        transactionType: {
          bonus: string;
          deposit: string;
          payment: string;
          refund: string;
          transfer: string;
          transaction: string;
          withdrawal: string;
        };
        transactions: string;
        withdraw: {
          status: {
            cancelled: string;
            failed: string;
            pending: string;
            processing: string;
            completed: string;
          };
        };
        yourNote: string;
        actions: {
          createWithdrawRequest: string;
        };
        adminNote: string;
        consultationIncome: string;
        consultationIncomeShort: string;
        contractNumberPlaceholder: string;
        contractReference: string;
        loadError: string;
        noTransactions: string;
        noWithdrawRequests: string;
        pendingWithdrawRequests: string;
        requestsProcessing: string;
        submittedAt: string;
        subtitle: string;
        thisMonthIn: string;
        thisMonthInDescription: string;
        toast: {
          invalidWithdrawAmount: string;
          missingBankBin: string;
          missingBankInfo: string;
          withdrawExceedsBalance: string;
          withdrawSubmitFailed: string;
          withdrawSubmitted: string;
        };
        transactionsInMonth: string;
        transferReference: string;
        withdrawModal: {
          accountHolderLabel: string;
          accountHolderPlaceholder: string;
          accountNumberLabel: string;
          accountNumberPlaceholder: string;
          amountLabel: string;
          amountPlaceholder: string;
          bankLabel: string;
          bankPlaceholder: string;
          bankSearchPlaceholder: string;
          contractLabel: string;
          noBankFound: string;
          noteLabel: string;
          notePlaceholder: string;
          title: string;
        };
        withdrawRequestsTitle: string;
      };
    };
    MedicalTerms: {
      cardiology: string;
      diagnostics: string;
      patientRecords: string;
      retinalScreening: string;
      ophthalmology: string;
    };
    GuestHome: {
      badge: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
    };
    GuestMaintenance: {
      badge: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
      card1: {
        title: string;
        description: string;
      };
      card2: {
        title: string;
        description: string;
      };
    };
    GuestNotFound: {
      badge: string;
      title: string;
      description: string;
      requestedPath: string;
      primaryCta: string;
      secondaryCta: string;
    };
    GuestEnhancements: {
      breadcrumb: {
        ariaLabel: string;
      };
      readingTime: string;
      complexity: {
        label: string;
        basic: string;
        moderate: string;
        advanced: string;
      };
      source: {
        auraGovernance: string;
      };
      terms: {
        fundus: string;
        oct: string;
        macular: string;
        intravitreal: string;
        avr: string;
        microaneurysm: string;
        tortuosity: string;
        hipaa: string;
        gdpr: string;
        phi: string;
        mfa: string;
        rbac: string;
      };
      tooltips: {
        fundus: string;
        oct: string;
        macular: string;
        intravitreal: string;
        avr: string;
        microaneurysm: string;
        tortuosity: string;
        hipaa: string;
        gdpr: string;
        phi: string;
        mfa: string;
        rbac: string;
      };
      imageMeta: {
        highResFundus: string;
        scaleOneToOne: string;
        processedLayer: string;
      };
      ctaSubtext: {
        quickAction: string;
        fastContact: string;
      };
      badges: {
        securityControl: string;
      };
      subheadings: {
        privacy: string;
        security: string;
        terms: string;
        personalData: string;
        status: string;
        notFound: string;
      };
      loading: {
        statusTitle: string;
        statusDescription: string;
      };
    };
    PatientDoctors: {
      avatar: {
        fallbackInitials: string;
      };
      common: {
        noData: string;
      };
      header: {
        title: string;
        subtitle: string;
        backToReview: string;
      };
      hero: {
        title: string;
        feature1: string;
        feature2: string;
        feature3: string;
        feature4: string;
        hotlineLabel: string;
        hotline: string;
      };
      search: {
        placeholder: string;
      };
      consultMode: {
        now: string;
        schedule: string;
        clinics: string;
        nowNotice: string;
      };
      filters: {
        showOptions: string;
        hideOptions: string;
        title: string;
        clear: string;
        timeFrom: string;
        timeTo: string;
        minRating: string;
        price: string;
        min: string;
        max: string;
        any: string;
        maxRangeWarning: string;
        priceHint: string;
      };
      loading: {
        doctors: string;
        prices: string;
      };
      degrees: {
        Bachelor: string;
        Master: string;
        Doctorate: string;
        AssocProf: string;
        Professor: string;
        MD: string;
      };
      card: {
        unnamed: string;
        verifiedCredentials: string;
        verifiedOphthalmologist: string;
        degreeLabel: string;
        degreeMissing: string;
        certificateLabel: string;
        certificateMissing: string;
        experience: string;
        expertiseLabel: string;
        aboutLabel: string;
        bioMissing: string;
        generalOphthalmology: string;
        scheduleLabel: string;
        scheduleFlexible: string;
        scheduleNoSlots: string;
        scheduleNext: string;
        priceLabel: string;
        priceBySchedule: string;
        bookNow: string;
        bookAppointment: string;
      };
      empty: {
        title: string;
        adjustFilters: string;
        adjustSearch: string;
      };
      assistant: {
        title: string;
        description: string;
        cta: string;
      };
      modal: {
        verifiedExperience: string;
        noRating: string;
        reviewCount: string;
        totalCredentials: string;
        expertiseLabel: string;
        aboutDoctor: string;
        patientFeedback: string;
        anonymousPatient: string;
        noCommentProvided: string;
        noReviewsYet: string;
        bookAppointment: string;
      };
      credentials: {
        title: string;
        degrees: string;
        certificates: string;
        defaultDegree: string;
        defaultCertificate: string;
        empty: string;
      };
    };
    About: {
      heroTitle: string;
      heroDescription: string;
      values: {
        badge: string;
        title: string;
        description: string;
        cards: {
          healthEquity: {
            title: string;
            description: string;
          };
          privacyFirst: {
            title: string;
            description: string;
          };
          openSource: {
            title: string;
            description: string;
          };
          collaboration: {
            title: string;
            description: string;
          };
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
      };
    };
    HowItWorks: {
      hero: {
        badge: string;
        titlePrefix: string;
        titleSuffix: string;
        description: string;
        processingStatus: string;
        analyzing: string;
      };
      process: {
        badge: string;
        title: string;
        description: string;
      };
      steps: {
        capture: {
          title: string;
          description: string;
        };
        upload: {
          title: string;
          description: string;
        };
        analysis: {
          title: string;
          description: string;
        };
        assessment: {
          title: string;
          description: string;
        };
      };
      ai: {
        badge: string;
        titleLine1: string;
        titleLine2: string;
        description: string;
        tags: {
          deepLearning: string;
          computerVision: string;
          accuracy: string;
        };
      };
      features: {
        tortuosity: {
          title: string;
          description: string;
        };
        avr: {
          title: string;
          description: string;
        };
        microaneurysm: {
          title: string;
          description: string;
        };
      };
      trust: {
        title: string;
        description: string;
        badges: {
          hipaa: string;
          gdpr: string;
          bias: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
        secondary: string;
      };
    };
    Contact: {
      toast: {
        success: string;
        error: string;
      };
      hero: {
        badge: string;
        titlePrefix: string;
        titleSuffix: string;
        description: string;
        primaryCta: string;
      };
      partnerCard: {
        title: string;
        description: string;
        benefits: {
          volumeLicensing: string;
          whiteLabel: string;
          customIntegrations: string;
        };
      };
      info: {
        badge: string;
        title: string;
        description: string;
        emailSupport: string;
        responseTime: string;
        responseTimeValue: string;
        headquarters: string;
        headquartersValue: string;
      };
      form: {
        title: string;
        description: string;
        contactPerson: string;
        fullName: string;
        role: string;
        workEmail: string;
        workEmailPlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        organizationDetails: string;
        organizationName: string;
        organizationType: string;
        organizationTypeClinic: string;
        organizationTypeHospital: string;
        cityLocation: string;
        businessCode: string;
        businessCodePlaceholder: string;
        taxCode: string;
        taxCodePlaceholder: string;
        partnershipNeeds: string;
        estimatedMonthlyScreenings: string;
        selectRange: string;
        additionalInformation: string;
        additionalInfoPlaceholder: string;
        termsPrefix: string;
        termsOfService: string;
        and: string;
        privacyPolicy: string;
        sending: string;
        send: string;
      };
      impact: {
        title: string;
        description: string;
        partnerClinics: string;
        screeningsPerformed: string;
        countriesReached: string;
        freeForNonProfits: string;
      };
      faq: {
        title: string;
        items: {
          cost: {
            question: string;
            answer: string;
          };
          onboarding: {
            question: string;
            answer: string;
          };
        };
      };
    };
    Status: {
      labels: {
        operational: string;
        outage: string;
        degraded: string;
        checking: string;
      };
      time: {
        justNow: string;
        secondsAgo_one: string;
        secondsAgo_other: string;
        minutesAgo_one: string;
        minutesAgo_other: string;
      };
      overall: {
        allOperational: string;
        partialOutage: string;
        majorOutage: string;
        checkingSystems: string;
      };
      hero: {
        title: string;
        description: string;
        lastUpdated: string;
        refresh: string;
      };
      metrics: {
        totalScreenings: string;
        totalScreeningsTrend: string;
        aiModelVersion: string;
        fdaCleared: string;
        servicesOnline: string;
        servicesChecked: string;
        avgProcessing: string;
        avgProcessingDetail: string;
        currentState: string;
        lastCheckText: string;
      };
      componentStatus: {
        title: string;
        serviceName: string;
        region: string;
        status: string;
      };
      services: {
        aiCore: {
          name: string;
          description: string;
          region: string;
        };
        imageApi: {
          name: string;
          description: string;
          region: string;
        };
        providerPortal: {
          name: string;
          description: string;
          region: string;
        };
        patientStore: {
          name: string;
          description: string;
          region: string;
        };
      };
      trust: {
        title: string;
        cards: {
          bias: {
            title: string;
            description: string;
            cta: string;
          };
          privacy: {
            title: string;
            description: string;
            cta: string;
          };
          validation: {
            title: string;
            description: string;
            cta: string;
          };
        };
      };
    };
    Home: {
      hero: {
        badge: string;
        titlePrefix: string;
        titleHighlight: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        socialProof: string;
        analysisResult: string;
        lowRisk: string;
        confidenceScore: string;
      };
      features: {
        title: string;
        description: string;
        cards: {
          aiPrecision: {
            title: string;
            description: string;
          };
          globalAccess: {
            title: string;
            description: string;
          };
          privacyFirst: {
            title: string;
            description: string;
          };
        };
      };
      workflow: {
        badge: string;
        title: string;
        steps: {
          upload: {
            title: string;
            description: string;
          };
          analysis: {
            title: string;
            description: string;
          };
          report: {
            title: string;
            description: string;
          };
        };
      };
      mission: {
        title: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        info: {
          nonProfitTitle: string;
          nonProfitDescription: string;
          openSourceTitle: string;
          openSourceDescription: string;
        };
      };
      stats: {
        scansAnalyzed: string;
        accuracyRate: string;
        countriesReached: string;
        nonProfit: string;
      };
      liveStats: {
        ophthalmologists: string;
        organisations: string;
        availableSlots: string;
        resources: string;
      };
    };
    EthicsPrivacy: {
      hero: {
        badge: string;
        titleLine1: string;
        titleLine2: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        secureEnclave: string;
        processingNode: string;
      };
      compliance: {
        title: string;
      };
      pillarsSection: {
        title: string;
        description: string;
      };
      pillars: {
        privacy: {
          title: string;
          description: string;
        };
        ethicalAi: {
          title: string;
          description: string;
        };
        transparency: {
          title: string;
          description: string;
        };
      };
      journey: {
        title: string;
        description: string;
        link: string;
      };
      dataJourney: {
        upload: {
          title: string;
          description: string;
        };
        anonymization: {
          title: string;
          description: string;
        };
        analysis: {
          title: string;
          description: string;
        };
        delivery: {
          title: string;
          description: string;
        };
      };
      faq: {
        title: string;
        description: string;
        datasets: {
          question: string;
          answer: string;
        };
        humanLoop: {
          question: string;
          answer: string;
        };
        edgeCases: {
          question: string;
          answer: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
      };
    };
    Compliance: {
      hero: {
        titlePrefix: string;
        titleHighlight: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
      };
      certifications: {
        title: string;
        description: string;
      };
      security: {
        title: string;
        description: string;
        encryption: {
          title: string;
          description: string;
        };
        mfa: {
          title: string;
          description: string;
        };
        auditLogs: {
          title: string;
          description: string;
        };
        backups: {
          title: string;
          description: string;
        };
        uptime: {
          title: string;
          description: string;
        };
        rbac: {
          title: string;
          description: string;
        };
      };
      audits: {
        title: string;
        description: string;
        completed: string;
        soc2: {
          date: string;
          event: string;
          details: string;
        };
        hipaa: {
          date: string;
          event: string;
          details: string;
        };
        iso: {
          date: string;
          event: string;
          details: string;
        };
        pentest: {
          date: string;
          event: string;
          details: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
        secondary: string;
      };
    };
    PatientAnalysisDetail: {
      page: {
        title: string;
      };
      summary: {
        title: string;
      };
      actions: {
        backToReview: string;
      };
    };
    PatientReview: {
      page: {
        title: string;
        subtitle: string;
      };
      status: {
        healthy: string;
        low: string;
        moderate: string;
        high: string;
      };
      summary: {
        healthy: string;
        low: string;
        moderate: string;
        high: string;
      };
      empty: {
        description: string;
      };
      sections: {
        recommendedActions: string;
        learnMore: string;
      };
      labels: {
        retinalImage: string;
        retinalScanAlt: string;
        noImage: string;
        scanId: string;
        capturedAt: string;
        aiAssessment: string;
        aiConfidence: string;
        pdfFormat: string;
        primaryRecommendation: string;
      };
      descriptions: {
        bookConsultation: string;
        startNewAnalysis: string;
      };
      findingsDetected: string;
      findingsMore: string;
      backToDashboard: string;
      sessionLabel: string;
      actions: {
        startNewScreening: string;
        zoomImage: string;
        viewFullAnalysisDetails: string;
        bookConsultation: string;
        findSpecialist: string;
        askAuraAssistant: string;
        downloadReport: string;
        downloadingReport: string;
        newScan: string;
        viewAllResources: string;
      };
      footer: {
        importantDisclaimer: string;
        copyright: string;
      };
    };
    PatientAppointments: {
      page: {
        title: string;
        subtitle: string;
      };
      loading: {
        appointments: string;
        clinicAppointments: string;
      };
      stats: {
        upcoming: string;
        completed: string;
        total: string;
        cancelled: string;
      };
      filters: {
        label: string;
        all: string;
        upcoming: string;
        completed: string;
        cancelled: string;
      };
      sections: {
        organisationSlots: string;
        doctorSlots: string;
      };
      actions: {
        bookMoreSlot: string;
        rateClinic: string;
        viewChat: string;
        joinCall: string;
        cancel: string;
        viewDetails: string;
        bookFirstAppointment: string;
      };
      labels: {
        clinicVisit: string;
        organisationAppointment: string;
        reason: string;
        notScheduledYet: string;
        doctorName: string;
        videoConsultation: string;
        videoConsultationReady: string;
      };
      sessionType: {
        verification: string;
        videoCall: string;
        clinicBooking: string;
      };
      sessionStatus: {
        pending: string;
        confirmed: string;
        completed: string;
        cancelled: string;
      };
      clinicStatus: {
        pending: string;
        confirmed: string;
        checkedIn: string;
        inProgress: string;
        completed: string;
        cancelled: string;
        noShow: string;
      };
      empty: {
        clinicAll: string;
        clinicByFilter: string;
        doctorAll: string;
        doctorByFilter: string;
        noAppointmentsTitle: string;
        noAppointmentsAll: string;
        noAppointmentsByFilter: string;
      };
      toast: {
        cancelSigninRequired: string;
        feedbackSubmitted: string;
        feedbackAlreadyExists: string;
        feedbackSubmitFailed: string;
      };
      cancelModal: {
        title: string;
        message: string;
        confirmLabel: string;
        cancelLabel: string;
      };
      feedback: {
        submittedBadge: string;
        modalTitle: string;
        modalSubtitle: string;
        submitLabel: string;
      };
    };
    PatientDashboard: {
      greeting: {
        morning: string;
        afternoon: string;
        evening: string;
      };
      fallback: {
        firstName: string;
      };
      risk: {
        low: string;
        medium: string;
        high: string;
        critical: string;
        notAvailable: string;
      };
      badge: {
        looksHealthy: string;
        needsAttention: string;
      };
      detectedSummary: {
        low: string;
        medium: string;
        high: string;
        default: string;
      };
      header: {
        retinalOverview: string;
      };
      stats: {
        latestAiRiskStatus: string;
        noScans: string;
        nextAppointment: string;
        noneScheduled: string;
        walletBalance: string;
        noWalletValue: string;
      };
      hero: {
        title: {
          specialistVerified: string;
          aiScreening: string;
        };
        awaitingAnalysis: string;
        latestRetinalScanAlt: string;
        scanId: string;
        latestAnalysisResult: string;
        dateScanned: string;
        nextScreening: string;
        processingTitle: string;
        noResultsTitle: string;
        processingDescription: string;
        noResultsDescription: string;
      };
      actions: {
        newScreening: string;
        viewFullReport: string;
        openLatestSession: string;
        uploadFirstScan: string;
      };
      history: {
        title: string;
        viewAll: string;
        recentScreeningAlt: string;
        sessionLabel: string;
        imagesSingle: string;
        imagesMultiple: string;
        empty: string;
      };
      quickActions: {
        title: string;
        messageSpecialist: string;
        bookAppointment: string;
      };
    };
    PatientSettings: {
      page: {
        title: string;
        subtitle: string;
      };
      sections: {
        account: string;
        preferences: string;
        billing: string;
      };
      items: {
        profile: {
          title: string;
          description: string;
        };
        security: {
          title: string;
          description: string;
        };
        notifications: {
          title: string;
          description: string;
        };
        paymentMethods: {
          title: string;
          description: string;
        };
      };
      appearance: {
        title: string;
        darkMode: string;
        currentDark: string;
        currentLight: string;
        toggleAriaLabel: string;
      };
      language: {
        title: string;
        subtitle: string;
      };
    };
    PatientRoadmap: {
      page: {
        title: string;
        subtitle: string;
      };
      error: {
        title: string;
        description: string;
      };
      empty: {
        description: string;
      };
      risk: {
        badge: string;
        levels: {
          LOW: string;
          MEDIUM: string;
          HIGH: string;
          CRITICAL: string;
        };
      };
      generatedOn: string;
      source: string;
      sections: {
        nextSteps: {
          title: string;
          empty: string;
        };
        lifestyleAdvice: {
          title: string;
          empty: string;
        };
        warningSigns: {
          title: string;
          empty: string;
        };
      };
      followUp: {
        title: string;
        needed: string;
        timeframeFallback: string;
        notNeeded: string;
        disclaimer: string;
      };
    };
    PatientNotifications: {
      page: {
        title: string;
        subtitle: string;
      };
      connection: {
        label: string;
        active: string;
        inactive: string;
      };
      search: {
        placeholder: string;
      };
      filters: {
        all: string;
        unread: string;
        aiScreenings: string;
        consultations: string;
        appointments: string;
        wallet: string;
      };
      actions: {
        markAllRead: string;
        clickToViewDetails: string;
      };
      loading: {
        notifications: string;
      };
      empty: {
        title: string;
        adjustSearchOrFilters: string;
        waiting: string;
      };
      pagination: {
        showingRange: string;
        previous: string;
        next: string;
        pageOf: string;
      };
    };
    PatientPaymentCallback: {
      toast: {
        depositSuccess: string;
      };
      loading: {
        title: string;
        description: string;
      };
      success: {
        title: string;
        description: string;
      };
      failed: {
        title: string;
        fallbackDescription: string;
      };
      cancelled: {
        title: string;
        description: string;
      };
      labels: {
        amount: string;
        orderCode: string;
        newBalance: string;
      };
      actions: {
        backToWallet: string;
      };
    };
    PatientWallet: {
      page: {
        title: string;
        subtitle: string;
      };
      loading: {
        wallet: string;
      };
      error: {
        title: string;
        fallback: string;
        retry: string;
      };
      balance: {
        available: string;
      };
      actions: {
        topUpWallet: string;
        cancel: string;
      };
      stats: {
        thisMonth: string;
        totalDeposits: string;
        totalSpent: string;
        transactions: string;
      };
      paymentMethods: {
        title: string;
        vnpayDescription: string;
        vnpayLongDescription: string;
        payosDescription: string;
      };
      transactions: {
        title: string;
        totalCount: string;
        loadFailed: string;
        emptyTitle: string;
        emptyDescription: string;
      };
      transactionStatus: {
        completed: string;
      };
      transactionTypes: {
        deposit: string;
        withdrawal: string;
        payment: string;
        refund: string;
        transfer: string;
        bonus: string;
      };
      pagination: {
        previous: string;
        next: string;
        pageOf: string;
      };
      deposit: {
        title: string;
        subtitle: string;
        description: string;
        selectAmount: string;
        customAmountPlaceholder: string;
        currency: string;
        minAmount: string;
        maxAmount: string;
        paymentMethod: string;
        createFailed: string;
        creating: string;
        proceedToPay: string;
      };
    };
    PatientScreening: {
      page: {
        title: string;
        subtitle: string;
      };
      status: {
        completed: string;
        processing: string;
        pending: string;
        failed: string;
      };
      risk: {
        low: string;
        medium: string;
        high: string;
        critical: string;
      };
      badge: {
        looksHealthy: string;
        needsAttention: string;
      };
      stats: {
        totalScans: string;
        completed: string;
        processing: string;
        findings: string;
      };
      search: {
        placeholder: string;
      };
      list: {
        recentScans: string;
      };
      empty: {
        title: string;
        description: string;
      };
      labels: {
        bothEyes: string;
        finding: string;
        findings: string;
      };
      actions: {
        newScreening: string;
        filter: string;
        viewReview: string;
        viewDiagnosis: string;
        downloadReport: string;
        shareWithDoctor: string;
        delete: string;
      };
      diagnosis: {
        title: string;
        loading: string;
        detailsTitle: string;
        notAvailable: string;
        yes: string;
        no: string;
        type: {
          aiScreening: string;
          verifiedResult: string;
        };
        status: {
          verified: string;
        };
        fields: {
          createdAt: string;
          diagnosisCode: string;
          codingSystem: string;
          severityLevel: string;
          confidenceLevel: string;
          clinicalStatus: string;
          urgentCase: string;
          referralNeeded: string;
          followUpDate: string;
          finalizedAt: string;
          verifiedAt: string;
          verifiedBy: string;
        };
        sections: {
          clinicalSummary: string;
          findings: string;
          treatmentPlan: string;
          lifestyleAdvice: string;
          recommendations: string;
        };
        empty: {
          findings: string;
          recommendations: string;
        };
      };
    };
    PatientScreeningNew: {
      page: {
        title: string;
        uploadTitle: string;
        uploadSubtitle: string;
      };
      toast: {
        invalidFileType: string;
        duplicateImages: string;
      };
      errors: {
        noUploadedUrl: string;
        createSessionFailed: string;
        startAnalysisFailed: string;
      };
      validation: {
        notFundus: string;
        croppedEdges: string;
        blurry: string;
        tooDark: string;
        overexposed: string;
        highQuality: string;
        acceptableQuality: string;
        serviceUnavailable: string;
      };
      processing: {
        local: string;
        analyzingQuality: string;
      };
      status: {
        uploading: string;
        analyzing: string;
        ready: string;
        highQuality: string;
        qualityWarning: string;
        notFundus: string;
      };
      qualityStandards: {
        title: string;
        evenLighting: string;
        evenLightingDescription: string;
        sharpFocus: string;
        sharpFocusDescription: string;
        centeredOpticDisc: string;
        centeredOpticDiscDescription: string;
      };
      supportedFormats: {
        title: string;
        value: string;
      };
      dropzone: {
        dropHere: string;
        dragAndDrop: string;
        or: string;
        browseFiles: string;
        fromComputer: string;
        pasteHintPrefix: string;
        pasteHintSuffix: string;
      };
      queue: {
        title: string;
        empty: string;
        readyToSubmit: string;
      };
      consent: {
        title: string;
      };
      footer: {
        hipaa: string;
      };
      actions: {
        clearAll: string;
        retry: string;
        remove: string;
        startAnalysis: string;
        cancel: string;
        saving: string;
        agreeAndContinue: string;
      };
    };
    PatientProfile: {
      page: {
        title: string;
        subtitle: string;
      };
      loading: {
        profile: string;
      };
      error: {
        title: string;
        fallback: string;
      };
      toast: {
        profileUpdated: string;
        profileUpdateFailed: string;
        loadImageFailed: string;
        avatarUpdated: string;
        avatarUploadFailed: string;
        passwordChanged: string;
        passwordChangeFailed: string;
      };
      sections: {
        personalInformation: string;
        securitySettings: string;
      };
      fields: {
        fullName: string;
        email: string;
        emailImmutable: string;
        phoneNumber: string;
        dateOfBirth: string;
        gender: string;
        address: string;
      };
      gender: {
        preferNotToSay: string;
        male: string;
        female: string;
        other: string;
      };
      labels: {
        emailVerified: string;
        emailNotVerified: string;
        memberSince: string;
        twoFactorStatus: string;
        enabled: string;
        disabled: string;
      };
      avatar: {
        modalTitle: string;
        changeHint: string;
        dropHere: string;
        dragDrop: string;
        browseHint: string;
        pastePrefix: string;
        pasteSuffix: string;
        supportedFormats: string;
        savePhoto: string;
        uploading: string;
        selectImageFile: string;
        maxSizeError: string;
        readFileFailed: string;
      };
      security: {
        passwordTitle: string;
        passwordDescription: string;
        twoFactorTitle: string;
        notificationTitle: string;
        notificationDescription: string;
        changePasswordModalTitle: string;
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
        changingPassword: string;
      };
      actions: {
        edit: string;
        save: string;
        cancel: string;
        change: string;
        manage: string;
        configure: string;
        changePassword: string;
      };
    };
    PatientBookAppointment: {
      modal: {
        slotReserved: string;
        timeRemaining: string;
        date: string;
        time: string;
        price: string;
      };
      labels: {
        ophthalmologist: string;
        bookingFor: string;
        videoConsultation: string;
        inClinicOrVideo: string;
        selectTime: string;
        morning: string;
        afternoon: string;
        selected: string;
        at: string;
      };
      notice: {
        prefix: string;
        suffix: string;
      };
      empty: {
        noTimesFor: string;
        thisDate: string;
        selectDateAndTime: string;
      };
      errors: {
        signInRequired: string;
      };
      actions: {
        back: string;
        cancel: string;
        processing: string;
        confirmBooking: string;
      };
    };
    PatientClinics: {
      page: {
        title: string;
        subtitle: string;
      };
      search: {
        placeholder: string;
      };
      loading: {
        organisations: string;
        slots: string;
      };
      labels: {
        organisation: string;
        noAddress: string;
        quickDates: string;
        morning: string;
        afternoon: string;
        selectedSlot: string;
      };
      reasons: {
        routine: string;
        blurredVision: string;
        eyePressure: string;
        eyePain: string;
        firstVisit: string;
      };
      fields: {
        visitDate: string;
        visitReason: string;
        visitReasonPlaceholder: string;
      };
      slots: {
        title: string;
        organisation: string;
        selectOrganisation: string;
        remainingCapacity: string;
        availableCount: string;
        full: string;
      };
      actions: {
        bookClinicVisit: string;
        jumpToFirstAvailable: string;
      };
      empty: {
        organisations: string;
        selectOrganisationFirst: string;
        noSlotsForDate: string;
        noUpcomingSlots: string;
      };
      messages: {
        bookSuccess: string;
      };
      deposit: {
        label: string;
        fee: string;
        walletBalance: string;
        insufficient: string;
      };
      toast: {
        bookSuccess: string;
      };
    };
    PatientRetinalAnalysis: {
      page: {
        title: string;
      };
      toggles: {
        showHighlights: string;
        showHeatmap: string;
      };
      summary: {
        title: string;
        preAnalyzeDescription: string;
        analyzing: string;
        waitingOverlay: string;
      };
      actions: {
        preparingSession: string;
        outOfQuota: string;
        startScreening: string;
        continueToReview: string;
        reanalyze: string;
      };
      badge: {
        looksHealthy: string;
        needsAttention: string;
      };
      findings: {
        empty: {
          title: string;
          description: string;
        };
        normal: {
          title: string;
          description: string;
        };
        primaryTitle: string;
        relatedTitle: string;
        criticalHint: string;
        nextStepLabel: string;
        nextStepDescription: string;
        urgency: {
          critical: string;
          warning: string;
          caution: string;
          info: string;
          normal: string;
        };
        suggestion: {
          critical: string;
          warning: string;
          caution: string;
          info: string;
          normal: string;
        };
      };
      risk: {
        low: {
          label: string;
          summary: string;
        };
        moderate: {
          label: string;
          summary: string;
        };
        high: {
          label: string;
          summary: string;
        };
        healthy: {
          label: string;
          summary: string;
        };
      };
      errors: {
        noImagesInSession: string;
        loadScreeningFailed: string;
        noImageForAnalysis: string;
        quotaExceeded: string;
        quotaDeductFailed: string;
        modelLoading: string;
        invalidImage: string;
        analysisUnavailable: string;
      };
      analysis: {
        helper: {
          primaryFindingDescription: string;
          secondaryFindingDescription: string;
          confidenceDescription: string;
          detectedByAi: string;
          detectedByAiWithReview: string;
          detectedByAiTool: string;
        };
        persistedSummary: {
          high: string;
          moderate: string;
          normal: string;
          low: string;
        };
      };
      disclaimer: {
        importantLabel: string;
        message: string;
      };
    };
    PatientSidebar: {
      portalSubtitle: string;
      user: {
        defaultName: string;
      };
      nav: {
        dashboard: string;
        myScans: string;
        appointments: string;
        findClinics: string;
        healthRoadmap: string;
        chat: string;
        wallet: string;
        helpFeedback: string;
        settings: string;
      };
      actions: {
        logout: string;
      };
    };
    PatientHeader: {
      breadcrumb: {
        home: string;
      };
      search: {
        placeholder: string;
      };
      actions: {
        toggleTheme: string;
      };
      pages: {
        dashboard: string;
        screening: string;
        appointments: string;
        doctors: string;
        clinics: string;
        roadmap: string;
        chat: string;
        wallet: string;
        profile: string;
        settings: string;
        security: string;
        notifications: string;
      };
    };
    PatientChat: {
      phase: {
        preVisitLabel: string;
        preVisitDescription: string;
        inProgressLabel: string;
        inProgressDescription: string;
        completedLabel: string;
        completedDescription: string;
        chatOpensIn: string;
        autoOpenAtScheduledTime: string;
        unlockAfterVerification: string;
      };
      schedule: {
        pending: string;
        unavailable: string;
      };
      preview: {
        memoOnly: string;
        archived: string;
        locked: string;
        empty: string;
        imageAttachmentShared: string;
        scanShared: string;
        newMessage: string;
      };
      meeting: {
        joinLocked: string;
        joinBeforeMinutes: string;
        unlockAfter: string;
        joinMeeting: string;
        join: string;
        canJoinBeforeMinutes: string;
        ended: string;
        sessionExpired: string;
        linkPending: string;
        consultationCompleted: string;
      };
      composer: {
        initialSharedScanMessage: string;
        scanPreviewAlt: string;
        readyToShareScan: string;
        findingsCount: string;
        readyToShareImage: string;
        encrypted: string;
        imageAttachedBadge: string;
        characterLimitReached: string;
        placeholder: {
          scanContext: string;
          preVisit: string;
          inProgress: string;
          default: string;
        };
      };
      fallback: {
        assignedOphthalmologist: string;
        patient: string;
        retinalScan: string;
        notAvailable: string;
        you: string;
        sharedImage: string;
        pendingImage: string;
        riskLabelUnavailable: string;
        noSummaryAvailable: string;
      };
      toast: {
        invalidImageFile: string;
        imageTooLarge: string;
        uploadFailed: string;
        uploadFailedGeneric: string;
        imageAttached: string;
        sendMessageFailed: string;
      };
      session: {
        type: {
          verification: string;
          videoCall: string;
          clinicBooking: string;
        };
        status: {
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
      };
      message: {
        meta: {
          savedPreVisit: string;
          deliveredToDoctor: string;
          doctorNote: string;
        };
      };
      loading: {
        conversations: string;
      };
      search: {
        placeholder: string;
      };
      stats: {
        all: string;
        open: string;
        upcoming: string;
      };
      empty: {
        noSearchResultsTitle: string;
        noSearchResultsDescription: string;
        preVisitTitle: string;
        completedTitle: string;
        preVisitDescription: string;
        inProgressDescription: string;
        completedDescription: string;
        selectSessionTitle: string;
        selectSessionDescription: string;
      };
      typing: {
        doctorIsTyping: string;
      };
      chatStatus: {
        title: string;
        unreadActivity: string;
      };
      overview: {
        show: string;
        hide: string;
        close: string;
        title: string;
        appointment: string;
        lastActivity: string;
        consultationFee: string;
        phase: string;
        pendingScanShare: string;
        pendingScanAlt: string;
      };
      guidance: {
        title: string;
        description: string;
        sidebarDescription: string;
      };
    };
    FocusModeLayout: {
      steps: {
        upload: string;
        analysis: string;
        review: string;
      };
      breadcrumb: {
        home: string;
        newScreening: string;
      };
    };
    notification: {
      types: {
        screening: string;
        consultation: string;
        message: string;
        appointment: string;
        wallet: string;
        notification: string;
      };
    };
    Organisation: {
      sidebar: {
        dashboard: string;
        patients: string;
        organisation: string;
        historicalData: string;
        calendar: string;
        screening: string;
        analytics: string;
        slotManagement: string;
        contract: string;
        billing: string;
        wallet: string;
        reports: string;
        settings: string;
      };
      common: {
        cancel: string;
        close: string;
        currencyVnd: string;
        daysOfWeek: {
          friday: string;
          monday: string;
          saturday: string;
          sunday: string;
          thursday: string;
          tuesday: string;
          wednesday: string;
        };
        gender: {
          female: string;
          male: string;
        };
        fileSizeMb: string;
        idLabel: string;
        loading: string;
        next: string;
        notAvailable: string;
        previous: string;
        processing: string;
        refresh: string;
        today: string;
        yearsAbbr: string;
      };
      header: {
        actions: {
          toggleTheme: string;
        };
        breadcrumb: {
          pages: string;
        };
        defaultPageName: string;
        searchPlaceholder: string;
      };
      walkInPatientModal: {
        actions: {
          createPatient: string;
        };
        form: {
          address: string;
          addressPlaceholder: string;
          citizenId: string;
          citizenIdPlaceholder: string;
          dateOfBirth: string;
          fullName: string;
          fullNamePlaceholder: string;
          gender: string;
          genderOther: string;
          phoneNumber: string;
          phonePlaceholder: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        scan: {
          action: string;
          cancel: string;
          hint: string;
        };
        toast: {
          createSuccess: string;
          invalidQr: string;
          qrExtractSuccess: string;
        };
      };
      calendar: {
        actions: {
          completeVisit: string;
          noShow: string;
          scanQrCheckIn: string;
          startConsultation: string;
        };
        pageName: string;
        patient: {
          fallback: string;
        };
        qrModal: {
          subtitle: string;
          title: string;
        };
        states: {
          loadingAppointments: string;
          noAppointments: string;
          terminal: {
            cancelled: string;
            completed: string;
            noShow: string;
          };
        };
        stats: {
          checkedIn: string;
          inProgress: string;
          pending: string;
          total: string;
        };
        status: {
          cancelled: string;
          checkedIn: string;
          completed: string;
          confirmed: string;
          inProgress: string;
          noShow: string;
          pending: string;
        };
        summary: {
          records: string;
        };
        toast: {
          consultationStarted: string;
          invalidQr: string;
          markedNoShow: string;
          qrCheckInSuccess: string;
          qrNotBelongOrganisation: string;
          qrNotMatchAppointment: string;
          visitCompleted: string;
        };
      };
      contract: {
        actions: {
          cancelReupload: string;
          downloadTemplate: string;
          downloadTemplateHint: string;
          openOriginalFile: string;
          reupload: string;
          uploadSignedContract: string;
          viewTemplate: string;
          viewTemplateHint: string;
        };
        fields: {
          contactPerson: string;
          createdAt: string;
          email: string;
          organisationType: string;
          template: string;
          type: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        pageName: string;
        sections: {
          actions: string;
          contractInfo: string;
          organisationAccount: string;
          signedContract: string;
          signedDescriptionActive: string;
          signedDescriptionPending: string;
          uploadDescription: string;
          uploadSignedContract: string;
        };
        status: {
          active: string;
          pendingReview: string;
          pendingSignature: string;
        };
        states: {
          loading: string;
          noContractDescription: string;
          noContractTitle: string;
        };
        steps: {
          captureAndUpload: string;
          downloadAndPrint: string;
          signAndStamp: string;
        };
        summary: {
          contractCode: string;
          redirectIn: string;
        };
        toast: {
          downloadTemplateFailed: string;
          fileTooLarge: string;
          invalidFileType: string;
        };
        upload: {
          activatedDescription: string;
          activatedTitle: string;
          activeContractHint: string;
          awaitingAdminDescription: string;
          awaitingAdminTitle: string;
          dropzonePrefix: string;
          pdfUploaded: string;
          previewAlt: string;
          selectFileAction: string;
          signedContractAlt: string;
          supportedFormats: string;
        };
      };
      dashboard: {
        header: {
          subtitle: string;
          title: string;
        };
        identity: {
          defaultAdmin: string;
        };
        labels: {
          remainingAiQuota: string;
          utilizationRateToday: string;
        };
        pageName: string;
        sections: {
          appointmentStatus: {
            subtitle: string;
            title: string;
          };
          utilization: {
            subtitle: string;
            title: string;
          };
        };
        states: {
          unavailable: string;
        };
        stats: {
          pendingConfirmed: {
            change: string;
            title: string;
          };
          remainingAiQuota: {
            change: string;
            title: string;
          };
          totalAppointments: {
            change: string;
            title: string;
          };
          utilizationRate: {
            change: string;
            title: string;
          };
        };
        status: {
          cancelled: string;
          completed: string;
          confirmed: string;
          noShow: string;
          pending: string;
        };
        toast: {
          loadFailed: string;
        };
      };
      analytics: {
        pageName: string;
        header: {
          title: string;
          subtitle: string;
        };
        eye: {
          leftOd: string;
          rightOd: string;
        };
        error: {
          analysisUnavailable: string;
          apiKeyMissing: string;
          imageFetchFallback: string;
          quotaExceeded: string;
        };
        fallback: {
          hardExudates: {
            description: string;
            name: string;
          };
          microaneurysms: {
            description: string;
            name: string;
          };
        };
      };
      settings: {
        actions: {
          saveChanges: string;
          saving: string;
        };
        avatar: {
          alt: string;
          hint: string;
          uploadAction: string;
        };
        form: {
          aboutDescription: string;
          address: string;
          contactEmail: string;
          contactFullName: string;
          contactPhone: string;
          descriptionPlaceholder: string;
          licenseNumber: string;
          organisationName: string;
          taxCode: string;
          type: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        pageName: string;
        sections: {
          organisationInfo: string;
        };
        states: {
          loadFailed: string;
          loading: string;
          sectionInProgress: string;
        };
        tabs: {
          clinic: string;
          data: string;
          notifications: string;
          security: string;
          users: string;
        };
        toast: {
          avatarUploadFailed: string;
          avatarUploadSuccess: string;
          updateFailed: string;
          updateSuccess: string;
        };
      };
      reports: {
        actions: {
          exportCsv: string;
        };
        export: {
          csvHeader: string;
          fileName: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        metrics: {
          averageConfidence: string;
          highRiskCases: string;
          lowRiskCases: string;
          totalScreenings: string;
        };
        monthlyBreakdown: {
          title: string;
        };
        pageName: string;
        riskDistribution: {
          high: string;
          low: string;
          moderate: string;
          title: string;
        };
        table: {
          high: string;
          low: string;
          moderate: string;
          month: string;
          noData: string;
          total: string;
        };
      };
      screening: {
        actions: {
          buyMoreQuota: string;
          buyQuota: string;
          topUpWallet: string;
        };
        badges: {
          remainingQuota: string;
          remainingQuotaTitle: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        launch: {
          clinicalAdvisory: {
            description: string;
            title: string;
          };
          includedScans: string;
          readyDescription: string;
          title: string;
        };
        navigation: {
          cancelAndReturn: string;
          executingAiModel: string;
          proceedToReview: string;
          startAiAnalysis: string;
          transferringFiles: string;
        };
        pageName: string;
        quotaBanner: {
          description: string;
          title: string;
        };
        quotaModal: {
          creatingPayment: string;
          quantityLabel: string;
          title: string;
          topUpAction: string;
          totalPaymentLabel: string;
          unitPriceLabel: string;
          walletBalanceLabel: string;
          walletInsufficientPrefix: string;
          walletInsufficientSuffix: string;
          walletSufficient: string;
        };
        stepper: {
          launchAi: string;
          reviewAndSave: string;
          selectPatient: string;
          uploadImages: string;
        };
        toast: {
          buyQuotaFailed: string;
          buyQuotaSuccess: string;
          createSessionFailed: string;
          createSessionFailedGeneric: string;
          createTopUpFailed: string;
          invalidTopUpAmount: string;
          noPatientSelected: string;
          paymentLinkUnavailable: string;
          quotaExhausted: string;
          quotaUnitPriceUnavailable: string;
          walletInsufficient: string;
        };
        quality: {
          acceptable: string;
          blurry: string;
          croppedEdges: string;
          notFundus: string;
          optimal: string;
          overexposed: string;
          poor: string;
          tooDark: string;
          validationServiceError: string;
        };
        upload: {
          analyzingQuality: string;
          dropzone: {
            supportedFormats: string;
            title: string;
          };
          inventoryFiles: string;
          inventoryTitle: string;
          subtitle: string;
          title: string;
        };
        wallet: {
          topUpDescription: string;
        };
      };
      screeningResult: {
        actions: {
          analyzing: string;
          backToScreening: string;
          downloadPdf: string;
          downloadPdfDisabledTitle: string;
          downloadPdfTitle: string;
          generatingPdf: string;
          printPdf: string;
          reanalyze: string;
          refining: string;
          saved: string;
          saveRecord: string;
          saving: string;
          share: string;
          shareDisabledTitle: string;
          shareResultTitle: string;
        };
        aiResults: {
          emptyState: string;
          primaryFinding: string;
          title: string;
        };
        badges: {
          viewOnly: string;
        };
        confirmSave: {
          cancelLabel: string;
          confirmLabel: string;
          message: string;
          title: string;
        };
        editable: {
          consultationHint: string;
          consultationPlaceholder: string;
          consultationTitle: string;
          diagnosisTitle: string;
          summaryTitle: string;
        };
        header: {
          newDraft: string;
          patientLabel: string;
          sessionLabel: string;
          title: string;
        };
        network: {
          consultationNote: string;
          noAbnormalFindings: string;
          notProvidedYet: string;
          riskLevel: string;
          session: string;
          summary: string;
          title: string;
          topFindings: string;
        };
        pageName: string;
        patientFallback: string;
        riskCard: {
          title: string;
        };
        sessionInfo: {
          createdAt: string;
          imageCount: string;
          lastAssessed: string;
          model: string;
          sessionCode: string;
          title: string;
        };
        shareModal: {
          email: {
            attachPdf: string;
            attachRetinalImages: string;
            auraHint: string;
            placeholder: string;
            recipientLabel: string;
            send: string;
            walkInHint: string;
          };
          network: {
            intro: string;
            noDraft: string;
            post: string;
            riskLabel: string;
            summaryLabel: string;
          };
          tabs: {
            email: string;
            network: string;
          };
          title: string;
        };
        states: {
          loading: string;
          noAiDraft: string;
          notFound: string;
        };
        toast: {
          aiNoPredictionData: string;
          analyzeBeforeSave: string;
          analyzeCompleted: string;
          analyzeFailed: string;
          analyzingAi: string;
          downloadPdfFailed: string;
          downloadPdfSuccess: string;
          loadResultFailed: string;
          noteRequiredBeforeSave: string;
          quotaExhaustedForAnalyze: string;
          saveBeforePdf: string;
          saveFailed: string;
          saveSuccess: string;
          sessionNotFoundForAi: string;
          shareEmailFailed: string;
          shareEmailSuccess: string;
          shareNetworkFailed: string;
          shareNetworkSuccess: string;
          shareSelectAtLeastOne: string;
          shareWalkInEmailRequired: string;
        };
        summary: {
          high: {
            default: string;
            withPrimary: string;
          };
          moderate: {
            default: string;
            withPrimary: string;
          };
          low: {
            default: string;
            withPrimary: string;
          };
        };
        findings: {
          primaryOnly: string;
          primaryAndRelated: string;
          relatedOnly: string;
          manualAnnotations: string;
        };
      };
      wallet: {
        actions: {
          buy: string;
          confirmPurchase: string;
          creatingPayment: string;
          topUpAmount: string;
        };
        alert: {
          billingLoadFailedTitle: string;
          refreshHint: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        pageName: string;
        purchase: {
          customPackage: string;
          packageCredits: string;
          priceUnavailable: string;
          title: string;
        };
        purchaseModal: {
          balanceInsufficientPrefix: string;
          balanceSufficient: string;
          quotaAmount: string;
          title: string;
          totalCost: string;
          unitPrice: string;
          walletBalance: string;
        };
        sources: {
          monthlyContract: string;
          monthlySpent: string;
          purchased: string;
          title: string;
          unitPrice: string;
        };
        stats: {
          balance: string;
          monthlyIn: string;
          monthlyUsed: string;
          remainingQuota: string;
        };
        toast: {
          createTopUpFailed: string;
          customQuotaRange: string;
          insufficientBalance: string;
          invalidQuotaAmount: string;
          paymentLinkUnavailable: string;
          purchaseQuotaFailed: string;
          purchaseQuotaSuccess: string;
          unitPriceUnavailable: string;
        };
        topUpDescription: string;
        transactionTypes: {
          bonus: string;
          deposit: string;
          payment: string;
          refund: string;
          transaction: string;
          transfer: string;
          withdrawal: string;
        };
        transactions: {
          empty: string;
          loading: string;
          pageIndicator: string;
          quotaPurchase: string;
          title: string;
        };
      };
      recentPatients: {
        actions: {
          viewAll: string;
        };
        confidenceLabel: string;
        status: {
          pending: string;
          reviewed: string;
        };
        title: string;
      };
      patients: {
        actions: {
          clear: string;
          editContact: string;
          moreForPatient: string;
          retry: string;
          screenNow: string;
          viewHistory: string;
          walkInPatient: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        pageName: string;
        search: {
          placeholder: string;
        };
        states: {
          loadFailed: string;
          noMatch: string;
        };
        summary: {
          foundPatients: string;
        };
        table: {
          action: string;
          lastScreening: string;
          patient: string;
          risk: string;
          type: string;
        };
        toast: {
          loadFailed: string;
        };
        types: {
          auraPartner: string;
          walkIn: string;
        };
      };
      updatePatientModal: {
        badges: {
          auraAccount: string;
        };
        form: {
          address: string;
          addressPlaceholder: string;
          bmi: string;
          bmiPlaceholder: string;
          citizenId: string;
          citizenIdPlaceholder: string;
          dateOfBirth: string;
          diseaseHistory: string;
          diseaseHistoryPlaceholder: string;
          fullName: string;
          gender: string;
          genderOther: string;
          phoneNumber: string;
          phonePlaceholder: string;
        };
        header: {
          title: string;
        };
        readOnly: {
          address: string;
          age: string;
          citizenId: string;
          dateOfBirth: string;
          email: string;
          fullName: string;
          gender: string;
          phone: string;
        };
        sections: {
          administrativeInfo: string;
          medicalInfo: string;
          personalInfo: string;
          personalInfoManagedByAura: string;
        };
        toast: {
          noChanges: string;
          patientNotFound: string;
          updateFailed: string;
          updateSuccess: string;
        };
      };
      patientHistory: {
        actions: {
          backToPatients: string;
          openReviewPage: string;
        };
        detail: {
          createdAt: string;
          modelVersion: string;
          sessionStatus: string;
          subtitle: string;
          title: string;
        };
        header: {
          subtitle: string;
          title: string;
        };
        images: {
          alt: {
            boxedRetinalImage: string;
            heatmap: string;
            heatmapBackground: string;
            retinalImage: string;
            thumbnail: string;
          };
          boxed: string;
          empty: string;
          heatmap: string;
          imageIndex: string;
          original: string;
          selectToPreview: string;
          title: string;
        };
        pageName: string;
        record: {
          findingsNote: string;
          noFindings: string;
          noSummary: string;
          notSavedYet: string;
          riskLevel: string;
          savedAt: string;
          summary: string;
          title: string;
        };
        risk: {
          high: string;
          low: string;
          moderate: string;
        };
        sessions: {
          count: string;
          empty: string;
          images: string;
          title: string;
        };
        states: {
          detailLoadFailed: string;
          selectSession: string;
        };
        status: {
          completed: string;
          pending: string;
          saved: string;
        };
      };
      analysisSidebar: {
        analysis: {
          complete: string;
          fallbackMessage: string;
          idleMessage: string;
          processing: string;
          rerun: string;
          startAction: string;
        };
        findings: {
          noneDetected: string;
          title: string;
        };
        footer: {
          assistiveNotice: string;
          export: string;
          report: string;
        };
        layers: {
          exudates: string;
          hemorrhages: string;
          title: string;
          vesselSegmentation: string;
        };
        risk: {
          referralRecommended: string;
          title: string;
          tooltip: string;
        };
      };
      boxLabelSelector: {
        actions: {
          deleteBox: string;
        };
        confidence: {
          label: string;
        };
        custom: {
          apply: string;
          label: string;
          placeholder: string;
        };
        header: {
          editAi: string;
          manual: string;
        };
        search: {
          noResults: string;
          placeholder: string;
        };
        tabs: {
          custom: string;
          diseaseList: string;
        };
        urgency: {
          caution: string;
          critical: string;
          info: string;
          normal: string;
          warning: string;
        };
      };
      imageGallery: {
        actions: {
          upload: string;
        };
        count: {
          one: string;
          other: string;
        };
        dropzone: {
          hint: string;
        };
      };
      imageViewer: {
        defaultImageName: string;
        scaleLabel: string;
        scaleMicrometer: string;
      };
      retinalViewer: {
        actions: {
          close: string;
          delete: string;
          deleteSelectedBox: string;
          draw: string;
          drawNewBox: string;
          hideBoxes: string;
          select: string;
          selectEditBoxes: string;
          showBoxes: string;
          undo: string;
        };
        boxCount: {
          one: string;
          other: string;
        };
        heatmap: {
          brushSize: string;
          clear: string;
          dragToolkit: string;
          editTool: string;
          eraserTool: string;
          hide: string;
          intensity: string;
          intensityHigh: string;
          intensityLow: string;
          intensityMedium: string;
          label: string;
          opacity: string;
          opacityShort: string;
          show: string;
          threshold: string;
          thresholdShort: string;
          undoLastStroke: string;
        };
        image: {
          altHeatmapOverlay: string;
          altRetinalScan: string;
        };
        imageCounter: string;
        manualCount: string;
        title: string;
      };
      toolsSidebar: {
        brightnessContrast: string;
        comparePrevious: string;
        keyboardShortcuts: string;
        measurement: string;
        panTool: string;
        resetView: string;
        zoomIn: string;
        zoomOut: string;
      };
      slotManagement: {
        actions: {
          block: string;
          complete: string;
          createTemplate: string;
          delete: string;
          generateSlots: string;
          noShow: string;
          unblock: string;
        };
        common: {
          free: string;
        };
        confirmDelete: {
          cancelLabel: string;
          confirmLabel: string;
          message: string;
          title: string;
        };
        generate: {
          capacityOption: string;
          fromDate: string;
          selectTemplate: string;
          subtitle: string;
          template: string;
          title: string;
          toDate: string;
          useCurrentWeek: string;
        };
        navigation: {
          jumpTo: string;
        };
        pageName: string;
        quickPicker: {
          createFirst: string;
          optionMeta: string;
          subtitle: string;
          title: string;
        };
        states: {
          generateFromTemplate: string;
          loadingSlots: string;
          loadingTemplates: string;
          noOrganisationLinked: string;
          noSlotsThisDay: string;
          noTemplates: string;
        };
        stats: {
          available: string;
          blocked: string;
          booked: string;
          totalThisWeek: string;
        };
        status: {
          available: string;
          blocked: string;
          booked: string;
          cancelled: string;
          completed: string;
          expired: string;
          noShow: string;
          reserved: string;
        };
        summary: {
          dayBooked: string;
          daySlots: string;
        };
        table: {
          actions: string;
          capacity: string;
          deposit: string;
          status: string;
          time: string;
        };
        tabs: {
          dailySlots: string;
          generateSchedule: string;
          templateSetup: string;
        };
        template: {
          createTitle: string;
          dayOfWeek: string;
          depositFee: string;
          depositHint: string;
          depositPlaceholder: string;
          depositValue: string;
          endTime: string;
          existingTitle: string;
          maxCapacity: string;
          slotDuration: string;
          startTime: string;
          templateSummary: string;
        };
        toast: {
          generateSlotsFailed: string;
          generatedSlots: string;
          invalidDateRange: string;
          invalidMaxCapacity: string;
          invalidSlotDuration: string;
          invalidTimeRange: string;
          selectTemplateFirst: string;
          slotStatusUpdateFailed: string;
          slotStatusUpdated: string;
          templateCreateFailed: string;
          templateCreated: string;
          templateDeleteFailed: string;
          templateDeleted: string;
        };
      };
    };
    SystemAdmin: {
      common: {
        systemAdmin: string;
        noDataAvailable: string;
        loadingData: string;
        notAvailable: string;
        notProvided: string;
        noNotes: string;
        doctor: string;
        createdAt: string;
        reviewedAt: string;
        adminNote: string;
        status: {
          pending: string;
          approved: string;
          rejected: string;
          cancelled: string;
          processing: string;
          completed: string;
          failed: string;
        };
        actions: {
          refresh: string;
          approve: string;
          reject: string;
          cancel: string;
          processing: string;
          confirmApprove: string;
          confirmReject: string;
        };
        pagination: {
          previous: string;
          next: string;
          label: string;
          page: string;
        };
      };
      actions: {
        export: string;
      };
      header: {
        breadcrumb: {
          pages: string;
        };
        searchPlaceholder: string;
        toggleTheme: string;
      };
      sidebar: {
        dashboard: string;
        groups: {
          'user-directory': {
            label: string;
            description: string;
          };
          'contract-management': {
            label: string;
            description: string;
          };
          'billing-finance': {
            label: string;
            description: string;
          };
          'system-administration': {
            label: string;
            description: string;
          };
        };
        items: {
          organisations: string;
          ophthalmologists: string;
          'leave-requests': string;
          'employment-type-change-requests': string;
          patients: string;
          verifications: string;
          'contract-templates': string;
          contracts: string;
          'transaction-ledger': string;
          'withdrawal-requests': string;
          permissions: string;
          'audit-logs': string;
          settings: string;
          'aura-network': string;
        };
      };
      dashboard: {
        page: {
          title: string;
          description: string;
        };
        actions: {
          exporting: string;
          exportExcel: string;
          exportPdf: string;
        };
        states: {
          metricsLoadError: string;
        };
        common: {
          noData: string;
        };
        cards: {
          doctors: {
            title: string;
            description: string;
          };
          organisations: {
            title: string;
            description: string;
          };
          patients: {
            title: string;
            description: string;
          };
          liveConsultations: {
            title: string;
            description: string;
          };
          walletTopUps: {
            title: string;
            description: string;
          };
          consultationCommission: {
            title: string;
            description: string;
          };
        };
        charts: {
          common: {
            walletTopUps: string;
            consultationCommission: string;
          };
          monthlyRevenue: {
            title: string;
            description: string;
          };
          paymentMethods: {
            title: string;
            description: string;
          };
          dailyRevenue: {
            title: string;
            description: string;
          };
        };
        quotaUsage: {
          title: string;
          description: string;
          filters: {
            from: string;
            to: string;
          };
          states: {
            loadError: string;
            empty: string;
          };
          summary: {
            usedSlots: string;
            quotaCapacity: string;
            averageUtilization: string;
            nearLimitDays: string;
          };
          chart: {
            used: string;
            remaining: string;
          };
        };
        quotas: {
          day7: string;
          day14: string;
          day30: string;
        };
        pendingActions: {
          title: string;
          description: string;
          items: {
            doctorProfileReviews: {
              title: string;
              subtitle: string;
            };
            withdrawalRequests: {
              title: string;
              subtitle: string;
            };
            organisationOnboarding: {
              title: string;
              subtitle: string;
            };
          };
        };
        systemStatus: {
          title: string;
          api: string;
          database: string;
          operational: string;
          issue: string;
          connected: string;
          unreachable: string;
        };
        topDoctors: {
          title: string;
          description: string;
          reviews: string;
          noRatings: string;
          states: {
            empty: string;
          };
        };
        topOrganisations: {
          title: string;
          description: string;
          states: {
            empty: string;
          };
        };
        export: {
          sheetName: string;
          title: string;
          subtitle: string;
          generatedBy: string;
          columns: {
            section: string;
            metric: string;
            value: string;
          };
          rows: {
            section: {
              users: string;
              operations: string;
              pending: string;
              revenueYtd: string;
              paymentMethods: string;
              monthlyRevenue: string;
              monthlyPlatformCommission: string;
              dailyRevenue: string;
              dailyPlatformCommission: string;
              partTimeSlotQuotaUsage: string;
            };
            metric: {
              doctorsTotal: string;
              doctorsGrowth: string;
              organisationsTotal: string;
              organisationsGrowth: string;
              patientsTotal: string;
              patientsGrowth: string;
              liveConsultationSessions: string;
              ophthalmologistVerifications: string;
              withdrawalRequests: string;
              organisationOnboarding: string;
              walletTopUpsCalendarYear: string;
              consultationCommissionCalendarYear: string;
              quotaUsageDate: string;
            };
          };
        };
        toasts: {
          noDataForExport: string;
          exportSuccess: string;
          exportError: string;
          exportPdfSuccess: string;
          exportPdfError: string;
        };
      };
      ophthalmologists: {
        page: {
          title: string;
          description: string;
        };
        actions: {
          export: string;
          exporting: string;
        };
        status: {
          available: string;
          busy: string;
          unavailable: string;
          fullyBooked: string;
        };
        verification: {
          verified: string;
          pending: string;
          pendingUpdate: string;
          rejected: string;
        };
        toasts: {
          invalidSalaryForPayout: string;
          paySalarySuccess: string;
          paySalaryError: string;
          employmentTypeUnchanged: string;
          updateEmploymentSuccess: string;
          updateEmploymentError: string;
          deleteSuccess: string;
          deleteError: string;
          rejectError: string;
          noDataForExport: string;
          exportSuccess: string;
          exportError: string;
        };
        export: {
          sheetName: string;
          columns: {
            ophthalmologistId: string;
            fullName: string;
            email: string;
            phone: string;
            verificationStatus: string;
            isVerified: string;
            activeStatus: string;
            yearsOfExperience: string;
            organisation: string;
            createdAt: string;
          };
          values: {
            yes: string;
            no: string;
            active: string;
            inactive: string;
          };
        };
        table: {
          columns: {
            doctor: string;
            status: string;
            verification: string;
            requests: string;
            monthlyEarnings: string;
            dealTerms: string;
            rating: string;
            actions: string;
          };
          values: {
            yearsExperience: string;
            pendingRequests: string;
            totalRequests: string;
            commissionPending: string;
          };
          actions: {
            viewDetails: string;
            approveVerification: string;
            rejectVerification: string;
            moreActions: string;
            update: string;
            deleting: string;
            delete: string;
          };
        };
        tabs: {
          overview: string;
          pendingVerification: string;
          feedback: string;
        };
        stats: {
          totalDoctors: {
            title: string;
            description: string;
          };
          availableNow: {
            title: string;
            description: string;
          };
          pendingVerification: {
            title: string;
            description: string;
          };
          pendingRequests: {
            title: string;
            description: string;
          };
          monthlyRevenue: {
            title: string;
            description: string;
          };
        };
        overview: {
          averageRating: {
            title: string;
            basedOnReviews: string;
          };
          totalConsultations: {
            title: string;
            completed: string;
            totalRequests: string;
          };
          pendingPayouts: {
            title: string;
            description: string;
          };
        };
        filters: {
          searchPlaceholder: string;
          verification: {
            all: string;
            pending: string;
            approved: string;
            rejected: string;
          };
          status: {
            all: string;
          };
        };
        feedback: {
          state: {
            inProgress: string;
            comingSoon: string;
          };
        };
        requestsBanner: {
          pendingDoctors: string;
          hint: string;
        };
        states: {
          noPendingRequests: string;
          empty: string;
        };
        pagination: {
          showing: string;
          previous: string;
          page: string;
          next: string;
        };
        rejectModal: {
          title: string;
          reasonLabel: string;
          reasonPlaceholder: string;
          hint: string;
          links: {
            viewLicense: string;
            viewDegree: string;
          };
          actions: {
            cancel: string;
            confirm: string;
          };
          validation: {
            reasonRequired: string;
          };
        };
        detail: {
          stats: {
            totalRequests: string;
            pending: string;
            monthlyEarnings: string;
            rating: string;
          };
          sections: {
            bio: string;
            uploadedDocuments: string;
            rejectionReason: string;
            financialSummary: string;
            contractDealTerms: string;
          };
          links: {
            viewLicense: string;
            viewDegree: string;
          };
          financial: {
            totalEarnings: string;
            thisMonth: string;
            pendingPayout: string;
          };
          contract: {
            employment: string;
            commission: string;
            expectedSalary: string;
            actualSalary: string;
            pending: string;
            hoursPerWeek: string;
            employmentType: {
              fullTime: string;
              partTime: string;
            };
            actions: {
              saving: string;
              save: string;
              paying: string;
              paySalaryToWallet: string;
            };
          };
        };
        deleteModal: {
          title: string;
          message: string;
          confirmLabel: string;
          cancelLabel: string;
        };
      };
      leaveRequests: {
        title: string;
        description: string;
        summary: {
          pending: string;
          approved: string;
          total: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
          };
        };
        states: {
          empty: string;
          noActionAvailable: string;
        };
        dialog: {
          approveTitle: string;
          rejectTitle: string;
          period: string;
          adminNoteOptional: string;
          adminNotePlaceholder: string;
        };
        toasts: {
          approveSuccess: string;
          approveError: string;
          rejectSuccess: string;
          rejectError: string;
        };
      };
      employmentTypeChangeRequests: {
        title: string;
        description: string;
        summary: {
          pending: string;
          approved: string;
          total: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
          };
        };
        states: {
          empty: string;
          noActionAvailable: string;
        };
        dialog: {
          approveTitle: string;
          rejectTitle: string;
          transition: string;
          adminNoteOptional: string;
          adminNotePlaceholder: string;
        };
        toasts: {
          approveSuccess: string;
          approveError: string;
          rejectSuccess: string;
          rejectError: string;
        };
      };
      withdrawalRequests: {
        title: string;
        description: string;
        summary: {
          pendingRequests: string;
          totalAmountCurrentPage: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
          };
        };
        states: {
          empty: string;
        };
        history: {
          title: string;
          refresh: string;
          loading: string;
          empty: string;
          withdrawalType: string;
          columns: {
            created: string;
            doctor: string;
            amount: string;
            type: string;
            reference: string;
            description: string;
          };
        };
        modals: {
          confirm: {
            title: string;
            transferReference: string;
            processing: string;
            confirm: string;
          };
          reject: {
            title: string;
            reasonOptional: string;
            processing: string;
          };
        };
        requestCard: {
          payOSLabel: string;
          amount: string;
          bankAndAccount: string;
          bankBinLabel: string;
          time: string;
          processedAt: string;
          contract: string;
          transferCode: string;
          doctorNote: string;
          payOSId: string;
          reference: string;
          tooltips: {
            payoutViaPayOS: string;
            syncPayOS: string;
          };
          actions: {
            payoutProcessing: string;
            payoutViaPayOS: string;
            syncingPayOS: string;
            syncPayOS: string;
            confirmManual: string;
          };
          warnings: {
            missingBankBin: string;
          };
        };
        toasts: {
          confirmSuccess: string;
          confirmError: string;
          rejectSuccess: string;
          rejectError: string;
          payosPayoutSuccess: string;
          payosPayoutError: string;
          payosSyncSuccess: string;
          payosSyncError: string;
        };
      };
      contractTemplateEditor: {
        titleCreate: string;
        titleDetail: string;
        subtitle: string;
        status: {
          active: string;
          inactive: string;
        };
        sections: {
          templateFile: string;
          templateMetadata: string;
        };
        fields: {
          title: {
            label: string;
            placeholder: string;
          };
          type: {
            label: string;
            ophthalmologist: string;
            medicalOrganization: string;
          };
          employmentMode: {
            label: string;
            fullTime: string;
            partTime: string;
          };
          version: {
            label: string;
            placeholder: string;
          };
          effectiveDate: {
            label: string;
          };
        };
        links: {
          previewUploadedFile: string;
          openCurrentTemplateFile: string;
        };
        actions: {
          backToTemplates: string;
          uploadDocxFile: string;
          updatingStatus: string;
          deactivate: string;
          activate: string;
          createTemplate: string;
          saveChanges: string;
        };
        metadata: {
          createdAt: string;
          updatedAt: string;
          contractsUsingTemplate: string;
        };
        errors: {
          templateNameRequired: string;
          contractVersionRequired: string;
          employmentTypeRequired: string;
          docxRequired: string;
          saveFailed: string;
        };
      };
      contractTemplates: {
        title: string;
        description: string;
        status: {
          active: string;
          inactive: string;
        };
        contractType: {
          ophthalmologist: string;
          organization: string;
        };
        card: {
          version: string;
          effective: string;
          docxTemplate: string;
          contractsCount: string;
        };
        actions: {
          updatingStatus: string;
          deactivate: string;
          activate: string;
          editTemplate: string;
          preview: string;
          duplicate: string;
          delete: string;
          newTemplate: string;
          createNewTemplate: string;
        };
        summary: {
          totalTemplates: string;
          contractsIssued: string;
          templateCount: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
            activeOnly: string;
            inactiveOnly: string;
          };
        };
        states: {
          loadError: string;
          loadErrorPrefix: string;
          unknownError: string;
          empty: string;
        };
        deleteDialog: {
          title: string;
          description: string;
        };
      };
      contracts: {
        title: string;
        description: string;
        status: {
          draft: string;
          pendingSignature: string;
          active: string;
          expired: string;
          terminated: string;
          cancelled: string;
        };
        upload: {
          uploaded: string;
          missing: string;
        };
        summary: {
          totalContracts: string;
          pendingVerification: string;
          pendingUpload: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
          };
        };
        states: {
          empty: string;
          emptyValue: string;
        };
        table: {
          columns: {
            contractCode: string;
            doctor: string;
            status: string;
            upload: string;
            createdDate: string;
            actions: string;
          };
          actions: {
            viewDetails: string;
            verifyContract: string;
            dealAndVerify: string;
          };
        };
        detailDialog: {
          title: string;
          closeAriaLabel: string;
          fields: {
            contractNumber: string;
            status: string;
            fullName: string;
            email: string;
            template: string;
            createdDate: string;
            signedDate: string;
            aiQuota: string;
            monthlyAiQuota: string;
            commission: string;
            actualMonthlySalary: string;
            confirmedMonthlyQuota: string;
            commissionRatePercent: string;
            actualMonthlySalaryVnd: string;
          };
          sections: {
            quotaTerms: string;
            dealTerms: string;
            signedContract: string;
            templateDocx: string;
          };
          validation: {
            monthlyQuotaRequired: string;
            dealTermsRequired: string;
          };
          scannedContractAlt: string;
          pdfHint: string;
          notFinalized: string;
          currency: {
            vnd: string;
          };
          actions: {
            openOriginalFile: string;
            openTemplateFile: string;
            close: string;
            confirmContract: string;
          };
        };
        pagination: {
          label: string;
        };
      };
      users: {
        title: string;
        description: string;
        actions: {
          addUser: string;
          exporting: string;
          lockUser: string;
          unlockUser: string;
        };
        roles: {
          systemAdmin: string;
          organisationAdmin: string;
          doctor: string;
          operator: string;
          analyst: string;
        };
        filters: {
          searchPlaceholder: string;
          roleLabel: string;
          options: {
            allRoles: string;
          };
        };
        stats: {
          totalUsers: string;
          totalUsersDescription: string;
          activeUsers: string;
          activeUsersDescription: string;
          lockedAccounts: string;
          lockedAccountsDescription: string;
          roleTypes: string;
          roleTypesDescription: string;
        };
        table: {
          columns: {
            id: string;
            user: string;
            role: string;
            organization: string;
            lastLogin: string;
            status: string;
            actions: string;
          };
          values: {
            unknownUser: string;
          };
        };
        status: {
          active: string;
          inactive: string;
          locked: string;
        };
        states: {
          empty: string;
        };
        summary: {
          showing: string;
        };
        export: {
          columns: {
            name: string;
            email: string;
            createdAt: string;
            emailVerified: string;
          };
          sheetName: string;
          yes: string;
          no: string;
        };
        toasts: {
          userUnlocked: string;
          userLocked: string;
          toggleLockError: string;
          exportNoData: string;
          exportSuccess: string;
          exportError: string;
        };
      };
      patients: {
        title: string;
        description: string;
        actions: {
          exporting: string;
          viewDetails: string;
          viewMedicalHistory: string;
          walkInCannotBeLocked: string;
          lockPatient: string;
          unlockPatient: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
            registered: string;
            walkIn: string;
          };
        };
        stats: {
          totalPatients: string;
          totalPatientsDescription: string;
          registeredPatients: string;
          registeredPatientsDescription: string;
          walkInPatients: string;
          walkInPatientsDescription: string;
          lockedAccounts: string;
          lockedAccountsDescription: string;
        };
        table: {
          columns: {
            patient: string;
            patientType: string;
            linkedOrganisation: string;
            lastLogin: string;
            joined: string;
            status: string;
            actions: string;
          };
          values: {
            walkInProfile: string;
            walkIn: string;
            registered: string;
            unassigned: string;
            thisPatient: string;
          };
        };
        status: {
          active: string;
          inactive: string;
          locked: string;
        };
        states: {
          empty: string;
        };
        summary: {
          showing: string;
        };
        confirmModal: {
          lockTitle: string;
          lockMessage: string;
          confirmLock: string;
          cancelLock: string;
        };
        export: {
          columns: {
            fullName: string;
            email: string;
            phone: string;
            emailConfirmed: string;
            createdAt: string;
          };
          sheetName: string;
          yes: string;
          no: string;
        };
        toasts: {
          walkInNoLogin: string;
          activatedSuccess: string;
          lockedSuccess: string;
          updateStatusError: string;
          exportNoData: string;
          exportSuccess: string;
          exportError: string;
        };
      };
      organisations: {
        page: {
          title: string;
          description: string;
        };
        actions: {
          exporting: string;
          exportReport: string;
          reviewOnboarding: string;
          viewContracts: string;
          viewBilling: string;
          editMonthlyQuota: string;
          viewOrganisation: string;
          viewContract: string;
          renew: string;
          cancel: string;
          saving: string;
          saveQuota: string;
        };
        tabs: {
          allOrganisations: string;
          billingPayments: string;
          contracts: string;
        };
        stats: {
          totalOrganisations: string;
          totalOrganisationsDescription: string;
          activeOrganisations: string;
          activeOrganisationsDescription: string;
          purchasedQuota: string;
          purchasedQuotaDescription: string;
          inactiveOrganisations: string;
          inactiveOrganisationsDescription: string;
        };
        filters: {
          searchPlaceholder: string;
          status: {
            all: string;
          };
        };
        status: {
          active: string;
          inactive: string;
          suspended: string;
        };
        orgType: {
          clinic: string;
          hospital: string;
          organization: string;
          eye_center: string;
          other: string;
        };
        onboarding: {
          title: string;
          description: string;
          pendingLabel: string;
          approvalSuccess: string;
          empty: string;
          submittedAt: string;
          approving: string;
          approveAction: string;
          fields: {
            email: string;
            phone: string;
            contactPerson: string;
            license: string;
            taxCode: string;
            address: string;
            notes: string;
          };
        };
        table: {
          empty: string;
          contractStatus: {
            active: string;
            pending: string;
            expired: string;
            suspended: string;
          };
          organisations: {
            columns: {
              organisation: string;
              location: string;
              users: string;
              purchasedQuota: string;
              monthlyQuota: string;
              aiScreenings: string;
              contract: string;
              status: string;
              actions: string;
            };
            values: {
              credits: string;
              limit: string;
              used: string;
              remaining: string;
            };
          };
          billing: {
            columns: {
              organisation: string;
              monthlyAiUsage: string;
              purchasedQuota: string;
              monthlyQuota: string;
              managedPatients: string;
              monthlyBilling: string;
              pendingPayment: string;
              status: string;
              actions: string;
            };
            values: {
              screenings: string;
              credits: string;
              registered: string;
              walkIn: string;
              paid: string;
              pending: string;
            };
          };
          contracts: {
            columns: {
              organisation: string;
              contractStart: string;
              contractEnd: string;
              contractStatus: string;
              actions: string;
            };
          };
        };
        pagination: {
          showingSummary: string;
          previous: string;
          page: string;
          next: string;
        };
        quotaModal: {
          title: string;
          monthlyQuotaLimitLabel: string;
          currentUsage: string;
        };
        export: {
          columns: {
            name: string;
            type: string;
            address: string;
            contactEmail: string;
            licenseNumber: string;
            taxCode: string;
            deviceCount: string;
            usersCount: string;
            status: string;
            createdAt: string;
          };
          sheetName: string;
        };
        toasts: {
          loadOnboardingError: string;
          approveOnboardingError: string;
          exportNoData: string;
          exportSuccess: string;
          exportError: string;
          updateQuotaInvalid: string;
          updateQuotaSuccess: string;
          updateQuotaError: string;
        };
      };
      auditLogs: {
        title: string;
        description: string;
        actions: {
          exportExcel: string;
          exporting: string;
          viewJsonDetails: string;
          insert: string;
          update: string;
          delete: string;
        };
        summary: {
          totalEntries: string;
        };
        filters: {
          searchPlaceholder: string;
          actionLabel: string;
          entityLabel: string;
          entityPlaceholder: string;
          updating: string;
          actionOptions: {
            all: string;
            insert: string;
            update: string;
            delete: string;
          };
        };
        table: {
          columns: {
            timestamp: string;
            user: string;
            action: string;
            entity: string;
            ipAddress: string;
            details: string;
          };
        };
        states: {
          loadFailedTitle: string;
          loadFailedDescription: string;
          empty: string;
        };
        pagination: {
          previous: string;
          next: string;
          summary: string;
        };
        export: {
          noData: string;
          success: string;
          failed: string;
          sheetName: string;
          columns: {
            timestamp: string;
            userName: string;
            userId: string;
            action: string;
            entityName: string;
            entityId: string;
            ipAddress: string;
          };
        };
        time: {
          justNow: string;
          minutesAgo: string;
          hoursAgo: string;
          daysAgo: string;
        };
        values: {
          system: string;
        };
      };
      permissions: {
        page: {
          title: string;
          description: string;
          actions: {
            newPermission: string;
          };
        };
        tabs: {
          allPermissions: string;
          roleAssignments: string;
          userOverrides: string;
        };
        stats: {
          totalPermissions: string;
          totalPermissionsDescription: string;
          active: string;
          activeDescription: string;
          inactive: string;
          inactiveDescription: string;
          categories: string;
          categoriesDescription: string;
        };
        filters: {
          searchPlaceholder: string;
          categories: {
            all: string;
          };
          status: {
            all: string;
          };
        };
        status: {
          active: string;
          inactive: string;
        };
        table: {
          columns: {
            permission: string;
            category: string;
            description: string;
            status: string;
            actions: string;
          };
          actions: {
            edit: string;
            deactivate: string;
          };
        };
        states: {
          empty: string;
        };
        pagination: {
          showing: string;
          previous: string;
          page: string;
          next: string;
        };
        categories: {
          users: string;
          permissions: string;
          patients: string;
          ophthalmologists: string;
          organisations: string;
          screening: string;
          consultations: string;
          audit: string;
          dashboard: string;
        };
        common: {
          loading: string;
          actions: {
            cancel: string;
            saving: string;
          };
        };
        modals: {
          create: {
            title: string;
            actions: {
              create: string;
            };
            fields: {
              name: string;
              namePlaceholder: string;
              namePatternHint: string;
              nameConventionPrefix: string;
              nameConventionSuffix: string;
              displayName: string;
              displayNamePlaceholder: string;
              category: string;
              none: string;
              description: string;
              descriptionPlaceholder: string;
            };
            errors: {
              createFailed: string;
            };
          };
          edit: {
            title: string;
            actions: {
              saveChanges: string;
            };
            fields: {
              nameReadonly: string;
              displayName: string;
              category: string;
              none: string;
              description: string;
            };
            errors: {
              updateFailed: string;
            };
          };
          delete: {
            title: string;
            actions: {
              deactivate: string;
            };
            messagePrefix: string;
            messageNote: string;
            errors: {
              deactivateFailed: string;
            };
          };
          assign: {
            title: string;
            searchPlaceholder: string;
            empty: string;
            actions: {
              assign: string;
            };
            errors: {
              assignFailed: string;
            };
          };
          userOverride: {
            title: string;
            subtitle: string;
            fields: {
              overrideType: string;
              permission: string;
              searchPermissionPlaceholder: string;
              expiresAt: string;
            };
            types: {
              grant: string;
              grantDescription: string;
              revoke: string;
              revokeDescription: string;
            };
            actions: {
              saveOverride: string;
            };
            errors: {
              saveFailed: string;
            };
          };
        };
        roles: {
          selectRole: string;
          roleCardHint: string;
          emptySelectRole: string;
          assignedCount: string;
          empty: string;
          actions: {
            assign: string;
            removeFromRole: string;
          };
        };
        users: {
          searchTitle: string;
          searchPlaceholder: string;
          rolesTitle: string;
          effectivePermissionsTitle: string;
          inheritedFromRolesTitle: string;
          inheritedFromRolesDescription: string;
          activeOverridesTitle: string;
          overrideHistoryTitle: string;
          status: {
            granted: string;
            denied: string;
            expired: string;
            revoked: string;
          };
          states: {
            noRolePermissions: string;
            noActiveOverrides: string;
            loadFailed: string;
          };
          actions: {
            addOverride: string;
            addDenyOverride: string;
            deny: string;
            removeOverride: string;
          };
        };
      };
      settings: {
        page: {
          title: string;
          description: string;
          actions: {
            saveChanges: string;
            saving: string;
          };
        };
        sections: {
          general: {
            title: string;
            description: string;
          };
          notifications: {
            title: string;
            description: string;
          };
          security: {
            title: string;
            description: string;
          };
          data: {
            title: string;
            description: string;
          };
        };
        toasts: {
          saveSuccess: string;
          saveFailed: string;
        };
        general: {
          platformName: string;
          supportEmail: string;
          timezone: string;
          timezoneOptions: {
            americaNewYork: string;
            americaLosAngeles: string;
            europeLondon: string;
            asiaHoChiMinh: string;
          };
          defaultLanguage: string;
          languageOptions: {
            en: {
              native: string;
              label: string;
            };
            vi: {
              native: string;
              label: string;
            };
          };
          minAdvanceBookingHours: string;
          aiQuotaUnitPrice: string;
          aiQuotaUnitPriceHint: string;
          freeAiQuota: string;
          partTimeMaxSlotsPerDay: string;
          partTimeMaxSlotsPerDayHint: string;
          fullTimeSlotWindowDays: string;
          fullTimeSlotWindowDaysHint: string;
          fullTimeMinSlotCost: string;
          fullTimeMaxSlotCost: string;
          fullTimeMaxSlotCostHint: string;
          pricingBands: {
            title: string;
            description: string;
            empty: string;
            experienceBand: string;
            experienceBandValue: string;
            minPrice: string;
            maxPrice: string;
          };
          aiQuotaBillingNote: string;
          trustedDomains: {
            title: string;
            descriptionPrefix: string;
            descriptionSuffix: string;
            empty: string;
            removeDomainAria: string;
            placeholder: string;
            add: string;
          };
          maintenanceMode: {
            title: string;
            description: string;
          };
        };
        notifications: {
          items: {
            emailNotifications: {
              label: string;
              description: string;
            };
            screeningAlerts: {
              label: string;
              description: string;
            };
            systemAlerts: {
              label: string;
              description: string;
            };
            weeklyReports: {
              label: string;
              description: string;
            };
            marketingEmails: {
              label: string;
              description: string;
            };
          };
        };
        security: {
          requireTwoFactor: {
            title: string;
            description: string;
          };
          sessionTimeout: string;
          minimumPasswordLength: string;
          maxLoginAttempts: string;
          ipWhitelist: string;
          ipWhitelistPlaceholder: string;
        };
        data: {
          databaseBackup: {
            title: string;
            lastBackup: string;
            createNow: string;
          };
          exportData: {
            title: string;
            description: string;
            exportToEmail: string;
          };
          dangerZone: {
            title: string;
            description: string;
            clearCache: string;
            resetStatistics: string;
          };
        };
      };
      statusPage: {
        title: string;
        description: string;
        common: {
          yes: string;
          no: string;
        };
        states: {
          loadError: string;
        };
        cards: {
          api: {
            title: string;
            description: string;
            values: {
              operational: string;
              issue: string;
            };
          };
          database: {
            title: string;
            description: string;
            values: {
              connected: string;
              unreachable: string;
            };
          };
          liveConsultations: {
            title: string;
            description: string;
          };
        };
        betterStack: {
          title: string;
          description: string;
          embedTitle: string;
          actions: {
            openBetterStack: string;
          };
          summary: {
            enabledLabel: string;
            configuredMonitorsLabel: string;
          };
          states: {
            emptyMonitors: string;
            embedNotConfigured: string;
          };
        };
      };
      cashflow: {
        title: string;
        description: string;
        roles: {
          patient: string;
          ophthalmologist: string;
          organisation: string;
        };
        status: {
          refunded: string;
        };
        summary: {
          totalCurrentPage: string;
          patients: string;
          ophthalmologists: string;
          organisations: string;
        };
        filters: {
          searchPlaceholder: string;
          role: {
            all: string;
          };
          status: {
            all: string;
          };
        };
        states: {
          loading: string;
          loadError: string;
          empty: string;
        };
        table: {
          columns: {
            date: string;
            actor: string;
            role: string;
            type: string;
            amount: string;
            status: string;
            reference: string;
            action: string;
          };
          actions: {
            details: string;
          };
        };
        pagination: {
          pageSummary: string;
        };
        detailModal: {
          title: string;
          idLabel: string;
          sections: {
            general: string;
            topUp: string;
            withdrawal: string;
          };
          fields: {
            createdAt: string;
            status: string;
            actor: string;
            actorEmail: string;
            actorRole: string;
            amount: string;
            transactionType: string;
            referenceType: string;
            referenceId: string;
            description: string;
            orderCode: string;
            paymentMethod: string;
            completedAt: string;
            providerTxnRef: string;
            failureReason: string;
            paymentUrl: string;
            returnUrl: string;
            cancelUrl: string;
            providerResponse: string;
            processedAt: string;
            processedByAdmin: string;
            bankName: string;
            bankAccountNumber: string;
            accountHolder: string;
            bankBin: string;
            transferReference: string;
            payOSExternalPayoutId: string;
            payOSReferenceId: string;
            payOSTransactionId: string;
            payOSApprovalState: string;
            payoutFee: string;
          };
        };
      };
      verificationRequests: {
        title: string;
        description: string;
        common: {
          experienceYears: string;
          shortExperienceYears: string;
        };
        degreeLevels: {
          bachelor: string;
          master: string;
          doctorate: string;
          associateProfessor: string;
          professor: string;
        };
        requestType: {
          credentialUpdate: {
            label: string;
            hint: string;
          };
          onboarding: {
            label: string;
            hint: string;
          };
        };
        approveModal: {
          title: string;
          description: string;
          notice: string;
        };
        rejectModal: {
          title: string;
          reasonLabel: string;
          reasonPlaceholder: string;
          notice: string;
          errors: {
            reasonRequired: string;
          };
        };
        imagePreview: {
          alt: string;
        };
        detailModal: {
          title: string;
          sections: {
            licenses: string;
            degrees: string;
          };
          fields: {
            issuingAuthority: string;
            degreeLevel: string;
            issuedDate: string;
            expiryDate: string;
          };
          actions: {
            zoomImage: string;
            openDocument: string;
          };
          states: {
            emptyLicenses: string;
            emptyDegrees: string;
          };
        };
        summary: {
          pendingCount: string;
          description: string;
        };
        filters: {
          searchPlaceholder: string;
        };
        table: {
          columns: {
            doctor: string;
            credentialsSummary: string;
            verificationType: string;
            submittedAt: string;
            actions: string;
          };
          credentialsSummaryValue: string;
          credentialsSummaryHint: string;
        };
        actions: {
          viewDetails: string;
        };
        states: {
          emptyTitle: string;
          emptyDescription: string;
        };
        pagination: {
          showing: string;
          page: string;
        };
        toasts: {
          approveSuccess: string;
          approveError: string;
          rejectSuccess: string;
          rejectError: string;
        };
      };
    };
    ProfessionalNetwork: {
      common: {
        network: string;
        user: string;
        member: string;
        unknownAuthor: string;
        showMore: string;
        tryAgain: string;
        actions: {
          cancel: string;
          follow: string;
        };
        roles: {
          ophthalmologist: string;
          orgAdmin: string;
          systemAdmin: string;
          patient: string;
        };
        gender: {
          male: string;
          female: string;
          other: string;
        };
        pagination: {
          previous: string;
          next: string;
          pageOf: string;
        };
      };
      navigation: {
        feed: string;
        discover: string;
        saved: string;
        managePosts: string;
        profile: string;
      };
      sidebar: {
        backToOrganisationDashboard: string;
        backToDashboard: string;
        logout: string;
        theme: {
          lightMode: string;
          darkMode: string;
        };
      };
      rightPanel: {
        searchPlaceholder: string;
        sections: {
          trendingTopics: string;
          whoToFollow: string;
          yourGroups: string;
        };
        trending: {
          rankLabel: string;
          postsCount: string;
          tags: {
            aiScreening: string;
            diabeticRetinopathy: string;
            glaucomaGuidelines2026: string;
            smileSurgery: string;
            pediatricVision: string;
          };
        };
        groups: {
          membersCount: string;
        };
      };
      footer: {
        terms: string;
        privacy: string;
        help: string;
        copyright: string;
      };
      postTypes: {
        casePresentation: string;
        peerDiscussion: string;
        knowledgeShare: string;
        announcement: string;
      };
      specialties: {
        aiScreening: string;
        communityOphthalmology: string;
        deepLearning: string;
        diabeticRetinopathy: string;
        drScreening: string;
        retinalDiseases: string;
        glaucoma: string;
        retinopathyOfPrematurity: string;
        aiMedicalImaging: string;
        primaryEyeCare: string;
        octAnalysis: string;
        opticNerveImaging: string;
        pediatricRetina: string;
        retinalAnalysis: string;
        telemedicine: string;
      };
      reactions: {
        insightful: string;
        agree: string;
        helpful: string;
        question: string;
        celebrate: string;
      };
      discover: {
        title: string;
        description: string;
        searchPlaceholder: string;
        tabs: {
          professionals: string;
          organisations: string;
        };
        categories: {
          all: string;
        };
        results: {
          oneFound: string;
          manyFound: string;
        };
        empty: {
          title: string;
          description: string;
        };
      };
      feed: {
        title: string;
        description: {
          manageMode: string;
          default: string;
        };
        tabs: {
          feed: string;
          managePosts: string;
        };
        states: {
          loadError: string;
          empty: string;
        };
        manage: {
          reportedPostsHeading: string;
          hiddenPostsHeading: string;
          noReportedPosts: string;
          noHiddenPosts: string;
        };
        trending: {
          title: string;
          rankLabel: string;
          postsCount: string;
          empty: string;
        };
      };
      postDetail: {
        title: string;
        inputs: {
          addCommentPlaceholder: string;
          replyTo: string;
        };
        comments: {
          title: string;
        };
        actions: {
          reply: string;
          hide: string;
          view: string;
        };
        replies: {
          one: string;
          many: string;
        };
        states: {
          loadingReplies: string;
          notFound: string;
          noComments: string;
        };
      };
      postComposer: {
        placeholder: string;
        typeLabel: string;
        doctorNotesHeading: string;
        caseSource: {
          title: string;
          externalCase: string;
          internalCase: string;
        };
        internal: {
          selectConsultationCase: string;
          loadingInternalCases: string;
          chooseInternalCase: string;
          caseOptionLabel: string;
          anonymousPatient: string;
          previewTitle: string;
          retinalCasePreviewAlt: string;
          noImagePreview: string;
          medicalDiagnosis: string;
          noFinalDiagnosis: string;
          patientIdentityHidden: string;
          addDoctorNotes: string;
        };
        external: {
          allowedInfoOptional: string;
          patientAge: string;
          patientGender: string;
          allowedDataHint: string;
        };
        caseDisclosureConsent: string;
        fileAnonymizationConsent: string;
        actions: {
          addImage: string;
          attachDocument: string;
          addLink: string;
          shareInternalCase: string;
          post: string;
        };
      };
      postCard: {
        states: {
          hiddenByModeration: string;
          originalPostHidden: string;
        };
        repost: {
          shared: string;
        };
        menu: {
          copyLink: string;
          saved: string;
          savePost: string;
          hidePost: string;
          reportPost: string;
        };
        actions: {
          sharePost: string;
        };
        internalCase: {
          caseResultAndDiagnosis: string;
          noAiSummary: string;
          doctorNote: string;
          noDoctorNote: string;
        };
        hideDialog: {
          title: string;
          description: string;
          reasonPlaceholder: string;
        };
        shareDialog: {
          title: string;
          commentPlaceholder: string;
          previewAlt: string;
          share: string;
        };
      };
      shareClinicCaseModal: {
        title: string;
        caseInformation: {
          title: string;
        };
        fields: {
          patient: string;
          riskLevel: string;
          confidence: string;
        };
        retinalImages: {
          title: string;
          alt: string;
        };
        findings: {
          label: string;
        };
        symptoms: {
          label: string;
        };
        summary: {
          label: string;
        };
        doctorNotes: {
          label: string;
          placeholder: string;
        };
        preview: {
          title: string;
          empty: string;
        };
        actions: {
          posting: string;
          postCase: string;
        };
      };
      commentCard: {
        actions: {
          reacted: string;
          react: string;
          reply: string;
          hide: string;
          view: string;
        };
        time: {
          recentFallback: string;
        };
        replies: {
          one: string;
          many: string;
        };
      };
      saved: {
        title: string;
        sections: {
          allSaved: string;
          allSavedPosts: string;
        };
        count: {
          posts: string;
        };
        states: {
          loadError: string;
          empty: string;
        };
      };
      organisation: {
        title: string;
        types: {
          hospital: string;
          clinic: string;
          researchCenter: string;
        };
        actions: {
          follow: string;
          following: string;
        };
        stats: {
          followers: string;
          members: string;
          membersLabel: string;
          postsLabel: string;
        };
        tabs: {
          posts: string;
          members: string;
          about: string;
        };
        states: {
          notFound: string;
          noPosts: string;
          noPublicMembers: string;
        };
        accreditations: {
          jciAccredited: string;
          iso9001: string;
          nationalRetinalScreeningCenter: string;
          auraAiCertifiedPartner: string;
          fda510kCleared: string;
          ceMarkClassIIa: string;
          mohVnApproved: string;
          auraAiScreeningSite: string;
        };
        about: {
          title: string;
          location: string;
          accreditations: string;
        };
      };
      profile: {
        title: string;
        verified: string;
        preview: {
          banner: string;
          exit: string;
          label: string;
        };
        stats: {
          postsCount: string;
          yearsExperience: string;
        };
        states: {
          notFound: string;
          noPosts: string;
        };
        actions: {
          shareProfile: string;
          report: string;
        };
        systemAdmin: {
          title: string;
          description: string;
          items: {
            moderatePosts: string;
            reviewReports: string;
            maintainStandards: string;
          };
        };
        organisation: {
          introductionTitle: string;
          defaultBio: string;
          featuredServicesTitle: string;
          featuredServices: {
            items: {
              aiScreening: string;
              consultationAndReferral: string;
              recordsAndFollowUp: string;
            };
          };
          qualityCommitmentTitle: string;
          qualityCommitment: {
            items: {
              dataPrivacy: string;
              aiAndClinical: string;
              fastAccurateCare: string;
            };
          };
        };
        about: {
          bioTitle: string;
          noBio: string;
          experienceTitle: string;
          experienceValue: string;
          degreesTitle: string;
          noDegreeRecords: string;
          licensesTitle: string;
          noLicenseRecords: string;
          unknownAuthority: string;
          issued: string;
          expires: string;
          viewFile: string;
        };
      };
    };
  }

  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}
