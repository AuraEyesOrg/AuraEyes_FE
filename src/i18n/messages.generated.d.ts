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
        };
        showing: string;
        status: {
          draft: string;
          finalized: string;
          reviewed: string;
        };
        submitting: string;
        view: string;
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
          };
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
        };
        commission: string;
      };
      screeningReview: {
        note: string;
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
        };
        title: string;
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
        };
        transactions: string;
        withdraw: {
          status: {
            cancelled: string;
            failed: string;
            pending: string;
            processing: string;
          };
        };
        yourNote: string;
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
    };
    SystemAdmin: {
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
    };
  }

  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}
