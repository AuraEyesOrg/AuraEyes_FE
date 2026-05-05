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
    Shared: {
      buttons: {
        back: string;
        next: string;
        submit: string;
        save: string;
        cancel: string;
      };
      gender: {
        male: string;
        female: string;
        other: string;
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
      toggleLanguage: string;
      toggleMenu: string;
      switchToDark: string;
      switchToLight: string;
      sidebar: {
        auraNetwork: string;
      };
      noPermission: string;
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
      onboarding: {
        title: string;
        subtitle: string;
        success: string;
        error: string;
        submit: string;
        security: {
          tipTitle: string;
          tipDesc: string;
        };
        form: {
          newPassword: string;
          confirmPassword: string;
          fullName: string;
          phone: string;
          dob: string;
          gender: string;
          citizenId: string;
          address: string;
          licenseNumber: string;
          licenseImage: string;
          uploadText: string;
        };
        validation: {
          passwordRequired: string;
          passwordMin: string;
          passwordPattern: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
        };
      };
      login: {
        leftPanel: {
          titleLine: string;
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
          captchaRequired: string;
          turnstileRequired: string;
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
      registerDoctor: {
        leftPanel: {
          welcome: string;
          medicalExcellence: string;
          description: string;
          status: string;
          online: string;
        };
        form: {
          title: string;
          description: string;
          fullName: string;
          fullNamePlaceholder: string;
          email: string;
          emailPlaceholder: string;
          phone: string;
          phonePlaceholder: string;
          password: string;
          passwordPlaceholder: string;
          confirmPassword: string;
          confirmPasswordPlaceholder: string;
          experience: string;
          workingMode: string;
          fullTime: string;
          fullTimeDesc: string;
          partTime: string;
          partTimeDesc: string;
          workingHours: string;
          expectedSalary: string;
          suggestedSalary: string;
          bio: string;
          bioPlaceholder: string;
          degrees: string;
          addDegree: string;
          degreeItem: string;
          degreeLevels: {
            Bachelor: string;
            Master: string;
            Doctor: string;
            AssociateProfessor: string;
            Professor: string;
          };
          certificates: string;
          addCertificate: string;
          certificateItem: string;
          fields: {
            name: string;
            level: string;
            issuingAuthority: string;
            issuedDate: string;
            expiryDate: string;
            selectFile: string;
          };
          submit: string;
          submitting: string;
        };
        validation: {
          passwordsNotMatch: string;
          degreeRequired: string;
          certificateRequired: string;
          degreeFileRequired: string;
          certificateFileRequired: string;
          expiryDateRequired: string;
          expiryDateInvalid: string;
        };
        success: {
          title: string;
          subtitle: string;
          description: string;
          emailNotice: string;
          redirect: string;
          backHome: string;
        };
        toast: {
          success: string;
          failed: string;
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
        Dashboard: string;
        Patients: string;
        Screenings: string;
        LeaveRequests: string;
        Appointments: string;
        Schedules: string;
        EmploymentRequests: string;
        Consultations: string;
        AuraNetwork: string;
        Contract: string;
        Settings: string;
        Wallet: string;
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
        loadError: string;
        subtitle: string;
        reviewQueue: {
          title: string;
          description: string;
          pendingReviews: string;
          urgentCases: string;
          viewAll: string;
        };
        queue: {
          updating: string;
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
        appearance: string;
        notifications: string;
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
          updateSuccess: string;
          updateFailed: string;
        };
        validation: {
          avatarFileSize: string;
          avatarFileType: string;
        };
        title: string;
        displayOptions: string;
        language: string;
        theme: string;
        autoSaveDraft: string;
        compactMode: string;
        showTooltips: string;
        darkMode: string;
        lightMode: string;
        accentColor: string;
        emailNotifications: string;
        pushNotifications: string;
        appointmentReminders: string;
        weeklyDigest: string;
      };
      carePlan: {
        back: string;
        title: string;
        subtitle: string;
        addStep: string;
        addFirstStep: string;
        loading: string;
        loadError: string;
        empty: string;
        stats: {
          total: string;
          upcoming: string;
          overdue: string;
          completed: string;
        };
        toast: {
          stepCompleted: string;
          stepCompleteFailed: string;
          stepDeleted: string;
          stepDeleteFailed: string;
          stepAdded: string;
          stepAddFailed: string;
          stepUpdated: string;
          stepUpdateFailed: string;
        };
        confirm: {
          delete: string;
        };
      };
      consultations: {
        chat: {
          shareCase: {
            error: string;
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
        noPatients: string;
        noSearchResults: string;
        carePlan: string;
        latestVisit: string;
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
        pdfDocument: string;
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
        toolbox: {
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
          openHeatmapTools: string;
          addFinding: string;
        };
        findings: {
          namePlaceholder: string;
          descriptionLabel: string;
          descriptionPlaceholder: string;
          detectedFindings: string;
          finding: string;
          nameLabel: string;
          riskLabel: string;
          severityLow: string;
          severityModerate: string;
          severityHigh: string;
        };
        consiliumButton: string;
        consiliumModal: {
          subtitle: string;
          noDoctorsAvailable: string;
          maxDoctorsToast: string;
          availableStatus: string;
          emergencyDescription: string;
          sendEmergencyRequest: string;
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
      caseSnapshot: {
        alt: string;
        noImage: string;
        openReview: string;
      };
      urgentAIAlerts: {
        title: string;
        viewAll: string;
        aiConfidence: string;
        reviewNow: string;
        verify: string;
      };
      screeningQueue: {
        title: string;
        filter: string;
        sort: string;
        patientDetails: string;
        scanDate: string;
        aiPrediction: string;
        confidence: string;
        status: string;
        action: string;
        aiAnalyzed: string;
        flaggedForReview: string;
        reviewed: string;
        pending: string;
        check: string;
        quickApprove: string;
        startReview: string;
        pagination: string;
        previous: string;
        next: string;
      };
      profile: {
        toast: {
          profileUpdated: string;
          profileUpdateFailed: string;
          chooseImage: string;
          imageSize: string;
          avatarUpdated: string;
          avatarUploadFailed: string;
          certificateDeleted: string;
          certificateDeleteFailed: string;
        };
        confirm: {
          deleteCertificate: string;
          image: {
            invalidType: string;
            sizeExceeded: string;
            uploadFailed: string;
            attached: string;
            uploadError: string;
          };
        };
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
      recruitmentPopup: {
        title: string;
        description: string;
        cta: string;
        close: string;
      };
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
      trustedByPrefix: string;
      trustedBySuffix: string;
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
        screenings: string;
        feedbacks: string;
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
      sessionLabel: string;
      labels: {
        retinalImage: string;
        retinalScanAlt: string;
        noImage: string;
        scanId: string;
        capturedAt: string;
        aiAssessment: string;
        primaryRecommendation: string;
        pdfFormat: string;
      };
      status: {
        healthy: string;
        high: string;
      };
      summary: {
        healthy: string;
        high: string;
        moderate: string;
        low: string;
      };
      findingsDetected: string;
      findingsMore: string;
      actions: {
        zoomImage: string;
        viewFullAnalysisDetails: string;
        bookConsultation: string;
        findSpecialist: string;
        askAuraAssistant: string;
        downloadingReport: string;
        downloadReport: string;
        newScan: string;
        viewAllResources: string;
        startNewScreening: string;
      };
      sections: {
        recommendedActions: string;
        learnMore: string;
      };
      descriptions: {
        bookConsultation: string;
        startNewAnalysis: string;
      };
      consultation: {
        alreadyBookedTitle: string;
        alreadyBookedDescription: string;
        statusLabel: string;
        createdAtLabel: string;
      };
      empty: {
        description: string;
      };
    };
    PatientAppointments: {
      page: {
        eyebrow: string;
        title: string;
        subtitle: string;
      };
      pagination: {
        prev: string;
        next: string;
        pageOf: string;
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
        slots: string;
        awaitingPayment: string;
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
        bookNew: string;
        bookMoreSlot: string;
        rateClinic: string;
        viewChat: string;
        joinCall: string;
        cancel: string;
        viewDetails: string;
        bookFirstAppointment: string;
        showCheckInQr: string;
        payNow: string;
      };
      labels: {
        clinicVisit: string;
        organisationAppointment: string;
        reason: string;
        notScheduledYet: string;
        doctorName: string;
        videoConsultation: string;
        videoConsultationReady: string;
        consultingDoctor: string;
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
        depositPaid: string;
        checkedIn: string;
        inProgress: string;
        completed: string;
        cancelled: string;
        noShow: string;
        cancellationRequested: string;
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
        targetTitle: string;
        targetClinic: string;
        targetDoctor: string;
        targetStaff: string;
        ratingLabel: string;
        commentPlaceholder: string;
      };
      cancellation: {
        modalTitle: string;
        modalSubtitle: string;
        bankName: string;
        accountName: string;
        bankNumber: string;
        reason: string;
        successToast: string;
        errorToast: string;
        ruleNotice: string;
        ruleViolated: string;
        confirmLabel: string;
        cancelling: string;
        confirmDirect: string;
      };
      clinicBooking: {
        page: {
          title: string;
        };
      };
    };
    PatientDashboard: {
      greeting: {
        morning: string;
        afternoon: string;
        evening: string;
      };
      risk: {
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
      fallback: {
        firstName: string;
      };
      hero: {
        title: {
          aiScreening: string;
          specialistVerified: string;
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
      stats: {
        latestAiRiskStatus: string;
        noScans: string;
        nextAppointment: string;
        noneScheduled: string;
      };
      header: {
        retinalOverview: string;
      };
      quickActions: {
        title: string;
        bookAppointment: string;
        bookFollowUp: string;
        messageSpecialist: string;
      };
      actions: {
        viewFullReport: string;
        openLatestSession: string;
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
    };
    PatientCarePlan: {
      badge: string;
      page: {
        title: string;
        description: string;
      };
      stats: {
        upcoming: string;
        overdue: string;
        completed: string;
      };
      loading: string;
      error: string;
      empty: {
        title: string;
        message: string;
      };
    };
    PatientHelpFeedback: {
      page: {
        title: string;
        subtitle: string;
      };
      whyFeedbackMatters: {
        title: string;
        items: {
          bookingAndConsultation: string;
          bugReporting: string;
          featureSuggestions: string;
        };
      };
      form: {
        title: string;
        subtitle: string;
        unlockHint: string;
        success: {
          title: string;
          message: string;
        };
        actions: {
          leaveFeedback: string;
        };
      };
      modal: {
        title: string;
        subtitle: string;
        submitLabel: string;
        labels: {
          rating: string;
          ratingValidation: string;
          category: string;
          commentOptional: string;
          commentPlaceholder: string;
        };
        categories: {
          BUG: string;
          UX: string;
          SUGGESTION: string;
          OTHER: string;
        };
        actions: {
          notNow: string;
          submitting: string;
        };
        discard: {
          title: string;
          description: string;
          keepEditing: string;
          discardDraft: string;
        };
      };
      toast: {
        feedbackSubmitted: string;
      };
    };
    PatientDashboard_Legacy: {
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
      sourceBadges: {
        doctorReviewed: string;
        aiGenerated: string;
        doctorVerified: string;
      };
      actions: {
        viewDiagnosis: string;
        downloadPdf: string;
        preparingPdf: string;
      };
      toast: {
        downloadPdfSuccess: string;
        downloadPdfFailed: string;
      };
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
      timeline: {
        title: string;
        phases: {
          today: string;
          followUpInTwoWeeks: string;
          followUpOptional: string;
          ongoing: string;
        };
        titles: {
          immediateActions: string;
          followUpPlan: string;
          lifestyleRoutine: string;
        };
        fallbacks: {
          immediateActions: string;
          followUpNeeded: string;
          followUpNotNeeded: string;
          lifestyleRoutine: string;
        };
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
      diagnosis: {
        notAvailable: string;
        type: {
          aiScreening: string;
          verifiedResult: string;
        };
        status: {
          verified: string;
        };
        loading: string;
        title: string;
        fields: {
          createdAt: string;
          diagnosisCode: string;
          codingSystem: string;
          severityLevel: string;
          clinicalStatus: string;
          urgentCase: string;
          referralNeeded: string;
        };
        detailsTitle: string;
        yes: string;
        no: string;
      };
      risk: {
        low: string;
        medium: string;
        high: string;
        critical: string;
      };
      status: {
        pending: string;
        completed: string;
        processing: string;
        failed: string;
      };
      labels: {
        bothEyes: string;
        finding: string;
        findings: string;
      };
      page: {
        title: string;
        subtitle: string;
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
      actions: {
        filter: string;
        viewReview: string;
        viewDiagnosis: string;
        downloadReport: string;
        shareWithDoctor: string;
        delete: string;
      };
      list: {
        recentScans: string;
      };
      empty: {
        title: string;
        description: string;
      };
      badge: {
        looksHealthy: string;
        needsAttention: string;
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
      confirmModal: {
        title: string;
        subtitle: string;
        time: string;
        free: string;
        balanceAfter: string;
        terms: string;
        cancel: string;
        confirm: string;
        processing: string;
        close: string;
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
        medicalHistory: string;
        appointments: string;
        clinicSchedule: string;
        carePlan: string;
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
    PatientN8nChat: {
      title: string;
      subtitle: string;
      welcome: string;
      inputPlaceholder: string;
      status: {
        responding: string;
      };
      actions: {
        topUpNow: string;
      };
      quickPrompts: {
        findSpecificTime: string;
        availableThisWeek: string;
        bestMatch: string;
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
          email: string;
          emailPlaceholder: string;
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
          opening: string;
        };
        toast: {
          accountCreatedEmailSent: string;
          accountCreatedTempPassword: string;
          createSuccess: string;
          invalidQr: string;
          qrExtractSuccess: string;
        };
      };
      paymentConfirmationModal: {
        actions: {
          confirmCash: string;
          goToPayment: string;
        };
        header: {
          order: string;
          title: string;
        };
        methods: {
          cash: string;
          label: string;
          payosQr: string;
        };
        summary: {
          depositPaid: string;
          patient: string;
          remaining: string;
          totalFee: string;
        };
      };
      qrScannerModal: {
        actions: {
          flashOff: string;
          flashOn: string;
          retry: string;
        };
        error: {
          initFailed: string;
          notAllowed: string;
          notFound: string;
        };
        footer: string;
        hint: string;
        loading: string;
        status: {
          error: string;
          initializing: string;
          scanning: string;
          success: string;
        };
        title: string;
      };
      calendar: {
        actions: {
          collectCashDeposit: string;
          completeVisit: string;
          newWalkIn: string;
          noShow: string;
          payRemaining: string;
          scanQrCheckIn: string;
          startConsultation: string;
          markNoShow: string;
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
          billing: {
            pending: string;
            partiallyPaid: string;
            fullyPaid: string;
          };
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
          depositPaid: string;
          inProgress: string;
          noShow: string;
          pending: string;
          waitingForPayment: string;
        };
        summary: {
          records: string;
        };
        toast: {
          depositRequiredBeforeCheckIn: string;
          consultationStarted: string;
          invalidQr: string;
          markedNoShow: string;
          qrCheckInSuccess: string;
          qrNotBelongOrganisation: string;
          qrNotMatchAppointment: string;
          visitCompleted: string;
          noShowMarked: string;
        };
        bento: {
          totalBill: string;
          paidAmount: string;
          balance: string;
          remaining: string;
        };
        doctor: {
          consultingDoctor: string;
          defaultDoctor: string;
        };
        reason: string;
        walkInModal: {
          title: string;
          subtitle: string;
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
            billing: {
              pending: string;
              partiallyPaid: string;
              fullyPaid: string;
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
            depositPaid: string;
            inProgress: string;
            noShow: string;
            pending: string;
            waitingForPayment: string;
          };
          summary: {
            ready: string;
            pending: string;
          };
          actions: {
            create: string;
          };
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
          pdfDocument: string;
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
      dashboard: {
        title: string;
        subtitle: string;
        refresh: string;
        error: string;
        stats: {
          totalAppointments: string;
          checkedIn: string;
          completed: string;
          noShow: string;
        };
        bottleneckLongWait: string;
        bottleneckFullCapacity: string;
        bottleneckOverloaded: string;
        statusBadge: {
          waiting: string;
          inProgress: string;
          payment: string;
        };
        liveQueue: string;
        active: string;
        queueEmpty: string;
        patient: string;
        status: string;
        doctor: string;
        waitTime: string;
        doctorStatus: string;
        busy: string;
        noDoctors: string;
        handled: string;
        activeLoad: string;
        slotUtilization: string;
        booked: string;
        remaining: string;
        bottlenecks: string;
        noBottlenecks: string;
        quickActions: string;
        actions: {
          createSlot: string;
          createSlotDesc: string;
          assignDoctor: string;
          assignDoctorDesc: string;
          viewSchedule: string;
          viewScheduleDesc: string;
          addWalkIn: string;
          addWalkInDesc: string;
        };
      };
      sidebar: {
        items: {
          dashboard: string;
          'staff-management': string;
          'leave-requests': string;
          patients: string;
          'transaction-ledger': string;
          'refund-requests': string;
          scheduling: string;
          permissions: string;
          'audit-logs': string;
          settings: string;
          'aura-network': string;
        };
      };
      cashflow: {
        title: string;
        description: string;
        stats: {
          totalVolume: string;
          pendingAmount: string;
          completedOrders: string;
        };
        filterOptions: {
          all: string;
          completed: string;
          pending: string;
          cancelled: string;
        };
        status: {
          pending: string;
          confirmed: string;
          processing: string;
          completed: string;
          cancelled: string;
          refunded: string;
          partiallyPaid: string;
          fullyPaid: string;
          cancellationRequested: string;
        };
        table: {
          list: string;
          patientFallback: string;
          defaultDescription: string;
          onlineDeposit: string;
          fullPayment: string;
          refundedDeposit: string;
          paidLabel: string;
          deposited: string;
          remaining: string;
        };
        pagination: {
          previous: string;
          next: string;
          page: string;
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
        common: {
          gender: {
            male: string;
            female: string;
          };
          yearsAbbr: string;
          idLabel: string;
          notAvailable: string;
        };
        screening: {
          title: string;
          navigation: {
            cancelAndReturn: string;
            proceedToReview: string;
            transferringFiles: string;
            executingAiModel: string;
            startAiAnalysis: string;
          };
          upload: {
            title: string;
            subtitle: string;
            dropzone: {
              title: string;
              supportedFormats: string;
            };
            analyzingQuality: string;
          };
          quality: {
            notFundus: string;
            croppedEdges: string;
            blurry: string;
            tooDark: string;
            overexposed: string;
            optimal: string;
            acceptable: string;
            poor: string;
            validationServiceError: string;
          };
          launch: {
            title: string;
            readyDescription: string;
            clinicalAdvisory: {
              title: string;
              description: string;
            };
            includedScans: string;
          };
          quotaBanner: {
            title: string;
            description: string;
          };
          quotaModal: {
            title: string;
            quantityLabel: string;
            unitPriceLabel: string;
            totalPaymentLabel: string;
            walletBalanceLabel: string;
            walletSufficient: string;
            walletInsufficient: string;
            suggestedTopUp: string;
          };
          actions: {
            buyMoreQuota: string;
            buyQuota: string;
            topUpWallet: string;
          };
          toast: {
            bookSuccess: string;
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
          confirmModal: {
            title: string;
            subtitle: string;
            time: string;
            free: string;
            balanceAfter: string;
            terms: string;
            cancel: string;
            confirm: string;
            processing: string;
            close: string;
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
            medicalHistory: string;
            appointments: string;
            clinicSchedule: string;
            carePlan: string;
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
        PatientN8nChat: {
          title: string;
          subtitle: string;
          welcome: string;
          inputPlaceholder: string;
          status: {
            responding: string;
          };
          actions: {
            topUpNow: string;
          };
          quickPrompts: {
            findSpecificTime: string;
            availableThisWeek: string;
            bestMatch: string;
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
              email: string;
              emailPlaceholder: string;
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
              opening: string;
            };
            toast: {
              accountCreatedEmailSent: string;
              accountCreatedTempPassword: string;
              createSuccess: string;
              invalidQr: string;
              qrExtractSuccess: string;
            };
          };
          paymentConfirmationModal: {
            actions: {
              confirmCash: string;
              goToPayment: string;
            };
            header: {
              order: string;
              title: string;
            };
            methods: {
              cash: string;
              label: string;
              payosQr: string;
            };
            summary: {
              depositPaid: string;
              patient: string;
              remaining: string;
              totalFee: string;
            };
          };
          qrScannerModal: {
            actions: {
              flashOff: string;
              flashOn: string;
              retry: string;
            };
            error: {
              initFailed: string;
              notAllowed: string;
              notFound: string;
            };
            footer: string;
            hint: string;
            loading: string;
            status: {
              error: string;
              initializing: string;
              scanning: string;
              success: string;
            };
            title: string;
          };
          calendar: {
            actions: {
              collectCashDeposit: string;
              collectCashPayment: string;
              completeVisit: string;
              newWalkIn: string;
              noShow: string;
              payRemaining: string;
              scanQrCheckIn: string;
              startConsultation: string;
              markNoShow: string;
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
              billing: {
                pending: string;
                partiallyPaid: string;
                fullyPaid: string;
              };
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
              depositPaid: string;
              inProgress: string;
              noShow: string;
              pending: string;
              waitingForPayment: string;
            };
            summary: {
              records: string;
            };
            toast: {
              depositRequiredBeforeCheckIn: string;
              paymentRequiredBeforeCheckIn: string;
              consultationStarted: string;
              invalidQr: string;
              markedNoShow: string;
              qrCheckInSuccess: string;
              qrNotBelongOrganisation: string;
              qrNotMatchAppointment: string;
              visitCompleted: string;
              noShowMarked: string;
            };
            bento: {
              totalBill: string;
              paidAmount: string;
              balance: string;
              remaining: string;
            };
            doctor: {
              consultingDoctor: string;
              defaultDoctor: string;
            };
            reason: string;
            walkInModal: {
              title: string;
              subtitle: string;
              patient: {
                title: string;
                hint: string;
                create: string;
                search: string;
                loading: string;
                empty: string;
              };
              date: {
                label: string;
              };
              morning: string;
              afternoon: string;
              selectDoctor: string;
              consultation: string;
              slot: {
                title: string;
                loading: string;
                empty: string;
                remaining: string;
              };
              reason: {
                label: string;
                placeholder: string;
              };
              summary: {
                ready: string;
                pending: string;
              };
              actions: {
                create: string;
              };
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
              pdfDocument: string;
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
    ClinicStaffDashboard: {
      greetings: {
        morning: string;
        afternoon: string;
        evening: string;
      };
      stats: {
        todayAppointments: string;
        scheduled: string;
        patientsCheckedIn: string;
        today: string;
        pendingTasks: string;
        requiresAction: string;
        completedToday: string;
      };
      subtitle: string;
      activity: {
        title: string;
        subtitle: string;
        empty: string;
      };
      quickActions: {
        title: string;
        subtitle: string;
        newAppointment: string;
        newAppointmentDesc: string;
        registerPatient: string;
        registerPatientDesc: string;
        viewSchedule: string;
        viewScheduleDesc: string;
        cashierDesk: string;
        cashierDeskDesc: string;
      };
    };
    ClinicStaffQueue: {
      page: {
        title: string;
        subtitle: string;
      };
      tabs: {
        waiting: string;
        consulting: string;
        completed: string;
      };
    };
    ClinicStaffCashier: {
      page: {
        title: string;
        subtitle: string;
      };
    };
    ClinicStaffSidebar: {
      portalSubtitle: string;
      nav: {
        dashboard: string;
        queue: string;
        appointments: string;
        patients: string;
        medicalRecords: string;
        screenings: string;
        cashier: string;
        transactions: string;
        wallet: string;
        settings: string;
        profile: string;
      };
      actions: {
        logout: string;
      };
    };
    ClinicStaffHeader: {
      breadcrumb: {
        home: string;
      };
      search: {
        placeholder: string;
      };
      pages: {
        dashboard: string;
        queue: string;
        appointments: string;
        patients: string;
        'medical-records': string;
        screenings: string;
        schedules: string;
        cashier: string;
        billing: string;
        wallet: string;
        settings: string;
        profile: string;
        security: string;
        notifications: string;
      };
      actions: {
        toggleTheme: string;
      };
    };
    Cashier: {
      toast: {
        createSuccess: string;
        createError: string;
        cashSuccess: string;
      };
      header: {
        badge: string;
        title: string;
        description: string;
      };
      stats: {
        finalizedCount: string;
        currentlySelecting: string;
        noVisitSelected: string;
      };
      queue: {
        title: string;
        loadError: string;
        empty: string;
        emptySub: string;
        selectedBadge: string;
        doctorName: string;
      };
      pricingPanel: {
        title: string;
        description: string;
        noVisitSelectedBadge: string;
        selectPrompt: string;
        selectPromptSub: string;
        contextLoadError: string;
        paymentSuccessTitle: string;
        paymentSuccessDescription: string;
        backToList: string;
        patientLabel: string;
        doctorLabel: string;
        noMedication: string;
        medicationCount: string;
        medicinePriceLabel: string;
        manualPricePlaceholder: string;
        estimated: string;
        serviceFeeLabel: string;
        serviceFeeDescription: string;
        serviceFeeInputLabel: string;
        totalManual: string;
        payButton: string;
      };
      confirmModal: {
        title: string;
        message: string;
        confirm: string;
        cancel: string;
        patient: string;
        totalAmount: string;
        depositPaid: string;
        remaining: string;
        methodTitle: string;
        cash: string;
        payos: string;
        confirmCash: string;
        confirmPayos: string;
      };
    };
    ClinicStaffSettings: {
      title: string;
      subtitle: string;
      groups: {
        account: string;
      };
      tabs: {
        profile: string;
        security: string;
        notifications: string;
      };
      items: {
        profileDescription: string;
        securityDescription: string;
        notificationsDescription: string;
      };
      appearance: {
        title: string;
        darkMode: string;
        currentDark: string;
        currentLight: string;
        toggle: string;
      };
      language: {
        title: string;
        subtitle: string;
      };
    };
    ClinicStaff: {
      screeningNew: {
        title: string;
        subtitle: string;
        steps: {
          upload: string;
          launch: string;
        };
        quality: {
          title: string;
          lighting: string;
          lightingDesc: string;
          focus: string;
          focusDesc: string;
          centered: string;
          centeredDesc: string;
          supportedFormats: string;
          supportedFormatsList: string;
        };
        launch: {
          title: string;
          readyCount: string;
          advisory: {
            title: string;
            description: string;
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
            common: {
              gender: {
                male: string;
                female: string;
              };
              yearsAbbr: string;
              idLabel: string;
              notAvailable: string;
            };
            screening: {
              title: string;
              navigation: {
                cancelAndReturn: string;
                proceedToReview: string;
                transferringFiles: string;
                executingAiModel: string;
                startAiAnalysis: string;
              };
              upload: {
                title: string;
                subtitle: string;
                dropzone: {
                  title: string;
                  supportedFormats: string;
                };
                analyzingQuality: string;
              };
              quality: {
                notFundus: string;
                croppedEdges: string;
                blurry: string;
                tooDark: string;
                overexposed: string;
                optimal: string;
                acceptable: string;
                poor: string;
                validationServiceError: string;
              };
              launch: {
                title: string;
                readyDescription: string;
                clinicalAdvisory: {
                  title: string;
                  description: string;
                };
                includedScans: string;
              };
              quotaBanner: {
                title: string;
                description: string;
              };
              quotaModal: {
                title: string;
                quantityLabel: string;
                unitPriceLabel: string;
                totalPaymentLabel: string;
                walletBalanceLabel: string;
                walletSufficient: string;
                walletInsufficient: string;
                suggestedTopUp: string;
              };
              actions: {
                buyMoreQuota: string;
                buyQuota: string;
                topUpWallet: string;
              };
              toast: {
                buyQuotaSuccess: string;
                walletInsufficient: string;
                buyQuotaFailed: string;
                paymentLinkUnavailable: string;
                createTopUpFailed: string;
                noPatientSelected: string;
                quotaExhausted: string;
                quotaUnitPriceUnavailable: string;
                invalidTopUpAmount: string;
              };
              wallet: {
                topUpDescription: string;
              };
            };
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
        ClinicStaffDashboard: {
          greetings: {
            morning: string;
            afternoon: string;
            evening: string;
          };
          stats: {
            todayAppointments: string;
            scheduled: string;
            patientsCheckedIn: string;
            today: string;
            pendingTasks: string;
            requiresAction: string;
            completedToday: string;
          };
          subtitle: string;
          activity: {
            title: string;
            subtitle: string;
            empty: string;
          };
          quickActions: {
            title: string;
            subtitle: string;
            newAppointment: string;
            newAppointmentDesc: string;
            registerPatient: string;
            registerPatientDesc: string;
            viewSchedule: string;
            viewScheduleDesc: string;
            cashierDesk: string;
            cashierDeskDesc: string;
          };
        };
        actions: {
          retry: string;
          refresh: string;
          fillErm: string;
          editErm: string;
          createScreening: string;
          viewScreening: string;
          sending: string;
          sendToDoctor: string;
          copyDoctorLink: string;
        };
        page: {
          title: string;
          subtitle: string;
        };
        ClinicStaffQueue: {
          page: {
            title: string;
            subtitle: string;
          };
          tabs: {
            waiting: string;
            consulting: string;
            completed: string;
          };
        };
        ClinicStaffCashier: {
          page: {
            title: string;
            subtitle: string;
          };
        };
        ClinicStaffSidebar: {
          portalSubtitle: string;
          nav: {
            dashboard: string;
            queue: string;
            appointments: string;
            patients: string;
            medicalRecords: string;
            screenings: string;
            cashier: string;
            transactions: string;
            wallet: string;
            settings: string;
            profile: string;
          };
          actions: {
            logout: string;
          };
        };
        ClinicStaffHeader: {
          breadcrumb: {
            home: string;
          };
          search: {
            placeholder: string;
          };
          pages: {
            dashboard: string;
            queue: string;
            appointments: string;
            patients: string;
            'medical-records': string;
            screenings: string;
            schedules: string;
            cashier: string;
            billing: string;
            wallet: string;
            settings: string;
            profile: string;
            security: string;
            notifications: string;
          };
          actions: {
            toggleTheme: string;
          };
        };
        Cashier: {
          toast: {
            createSuccess: string;
            createError: string;
          };
          header: {
            badge: string;
            title: string;
            description: string;
          };
          stats: {
            finalizedCount: string;
            currentlySelecting: string;
            noVisitSelected: string;
          };
          queue: {
            title: string;
            loadError: string;
            empty: string;
            emptySub: string;
            selectedBadge: string;
            doctorName: string;
          };
          pricingPanel: {
            title: string;
            description: string;
            noVisitSelectedBadge: string;
            selectPrompt: string;
            selectPromptSub: string;
            contextLoadError: string;
            paymentSuccessTitle: string;
            paymentSuccessDescription: string;
            backToList: string;
            patientLabel: string;
            doctorLabel: string;
            noMedication: string;
            medicationCount: string;
            medicinePriceLabel: string;
            manualPricePlaceholder: string;
            estimated: string;
            serviceFeeLabel: string;
            serviceFeeDescription: string;
            serviceFeeInputLabel: string;
            totalManual: string;
            payButton: string;
          };
          confirmModal: {
            title: string;
            message: string;
            confirm: string;
            cancel: string;
          };
        };
        ClinicStaffSettings: {
          title: string;
          subtitle: string;
          groups: {
            account: string;
          };
          tabs: {
            profile: string;
            security: string;
            notifications: string;
          };
          items: {
            profileDescription: string;
            securityDescription: string;
            notificationsDescription: string;
          };
          appearance: {
            title: string;
            darkMode: string;
            currentDark: string;
            currentLight: string;
            toggle: string;
          };
          language: {
            title: string;
            subtitle: string;
          };
        };
        PatientDashboard: {
          greeting: {
            morning: string;
            afternoon: string;
            evening: string;
          };
          risk: {
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
          fallback: {
            firstName: string;
          };
          hero: {
            title: {
              aiScreening: string;
              specialistVerified: string;
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
          stats: {
            latestAiRiskStatus: string;
            noScans: string;
            nextAppointment: string;
            noneScheduled: string;
          };
          header: {
            retinalOverview: string;
          };
          quickActions: {
            title: string;
            bookAppointment: string;
            bookFollowUp: string;
            messageSpecialist: string;
          };
          actions: {
            viewFullReport: string;
            openLatestSession: string;
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
        };
        PatientCarePlan: {
          badge: string;
          page: {
            title: string;
            description: string;
          };
          stats: {
            upcoming: string;
            overdue: string;
            completed: string;
          };
          loading: string;
          error: string;
          empty: {
            title: string;
            message: string;
          };
        };
        PatientHelpFeedback: {
          page: {
            title: string;
            subtitle: string;
          };
          whyFeedbackMatters: {
            title: string;
            items: {
              bookingAndConsultation: string;
              bugReporting: string;
              featureSuggestions: string;
            };
          };
          form: {
            title: string;
            subtitle: string;
            unlockHint: string;
            success: {
              title: string;
              message: string;
            };
            actions: {
              leaveFeedback: string;
            };
          };
          modal: {
            title: string;
            subtitle: string;
            submitLabel: string;
            labels: {
              rating: string;
              ratingValidation: string;
              category: string;
              commentOptional: string;
              commentPlaceholder: string;
            };
            categories: {
              BUG: string;
              UX: string;
              SUGGESTION: string;
              OTHER: string;
            };
            actions: {
              notNow: string;
              submitting: string;
            };
            discard: {
              title: string;
              description: string;
              keepEditing: string;
              discardDraft: string;
            };
          };
          toast: {
            feedbackSubmitted: string;
          };
        };
        PatientScreening: {
          diagnosis: {
            notAvailable: string;
            type: {
              aiScreening: string;
              verifiedResult: string;
            };
            status: {
              verified: string;
            };
            loading: string;
            title: string;
            fields: {
              createdAt: string;
              diagnosisCode: string;
              codingSystem: string;
              severityLevel: string;
              clinicalStatus: string;
              urgentCase: string;
              referralNeeded: string;
            };
            detailsTitle: string;
            yes: string;
            no: string;
          };
          risk: {
            low: string;
            medium: string;
            high: string;
            critical: string;
          };
          status: {
            pending: string;
            completed: string;
            processing: string;
            failed: string;
          };
          labels: {
            bothEyes: string;
            finding: string;
            findings: string;
          };
          page: {
            title: string;
            subtitle: string;
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
          actions: {
            filter: string;
            viewReview: string;
            viewDiagnosis: string;
            downloadReport: string;
            shareWithDoctor: string;
            delete: string;
          };
          list: {
            recentScans: string;
          };
          empty: {
            title: string;
            description: string;
          };
          badge: {
            looksHealthy: string;
            needsAttention: string;
          };
        };
        PatientReview: {
          page: {
            title: string;
            subtitle: string;
          };
          sessionLabel: string;
          labels: {
            retinalImage: string;
            retinalScanAlt: string;
            noImage: string;
            scanId: string;
            capturedAt: string;
            aiAssessment: string;
            primaryRecommendation: string;
            pdfFormat: string;
          };
          status: {
            healthy: string;
            high: string;
          };
          summary: {
            healthy: string;
            high: string;
            moderate: string;
            low: string;
          };
          findingsDetected: string;
          findingsMore: string;
          actions: {
            zoomImage: string;
            viewFullAnalysisDetails: string;
            bookConsultation: string;
            findSpecialist: string;
            askAuraAssistant: string;
            downloadingReport: string;
            downloadReport: string;
            newScan: string;
            viewAllResources: string;
            startNewScreening: string;
          };
          sections: {
            recommendedActions: string;
            learnMore: string;
          };
          descriptions: {
            bookConsultation: string;
            startNewAnalysis: string;
          };
          consultation: {
            alreadyBookedTitle: string;
            alreadyBookedDescription: string;
            statusLabel: string;
            createdAtLabel: string;
          };
          empty: {
            description: string;
          };
        };
        ClinicStaff: {
          screeningNew: {
            title: string;
            subtitle: string;
            steps: {
              upload: string;
              launch: string;
            };
            quality: {
              title: string;
              lighting: string;
              lightingDesc: string;
              focus: string;
              focusDesc: string;
              centered: string;
              centeredDesc: string;
              supportedFormats: string;
              supportedFormatsList: string;
            };
            launch: {
              title: string;
              readyCount: string;
              advisory: {
                title: string;
                description: string;
              };
              scansIncluded: string;
              scansWarning: string;
            };
            actions: {
              proceed: string;
              launch: string;
              cancel: string;
              back: string;
              uploading: string;
              analyzing: string;
            };
            toast: {
              noPatient: string;
            };
          };
          queue: {
            toast: {
              sentToDoctorSuccess: string;
              sentToDoctorFailed: string;
              missingBasicInfo: string;
              screeningRequired: string;
              loadDoctorsFailed: string;
              copyDoctorConsultationLinkSuccess: string;
              copyDoctorConsultationLinkFailed: string;
              ermSaveRequiredBeforeScreening: string;
            };
            error: {
              title: string;
              message: string;
            };
            actions: {
              retry: string;
              refresh: string;
              fillErm: string;
              fillErmRequired: string;
              openErm: string;
              openErmHint: string;
              createScreeningDisabledHint: string;
              createScreening: string;
              viewScreening: string;
              sending: string;
              sendToDoctor: string;
              copyDoctorLink: string;
            };
            page: {
              title: string;
              subtitle: string;
            };
            tabs: {
              all: string;
            };
            empty: {
              title: string;
              message: string;
            };
            table: {
              patient: string;
              checkedIn: string;
              status: string;
              screening: string;
              doctor: string;
              action: string;
            };
            sendDoctorModal: {
              title: string;
              doctorLabel: string;
              loadingDoctors: string;
              selectDoctor: string;
              noDoctors: string;
              notesLabel: string;
              notesPlaceholder: string;
              confirm: string;
            };
            doctor: {
              yearsExp: string;
              notAssigned: string;
            };
            screening: {
              completed: string;
              pending: string;
            };
            states: {
              checkedIn: string;
              screeningPending: string;
              aiCompleted: string;
              sentToDoctor: string;
              consultationInProgress: string;
              finalized: string;
              awaitingDoctor: string;
              inConsultation: string;
              completed: string;
            };
          };
          patients: {
            summary: {
              countFound: string;
              patients: string;
              patient: string;
            };
            risk: {
              low: string;
              medium: string;
              high: string;
            };
          };
          common: {
            gender: {
              male: string;
              female: string;
            };
            yearsAbbr: string;
            idLabel: string;
            close: string;
          };
          latePatientModal: {
            actions: {
              cancelAndDiscount: string;
              createAndRebook: string;
              rebook: string;
            };
            adhoc: {
              cost: string;
              costPlaceholder: string;
              description: string;
              doctor: string;
              endTime: string;
              loadingDoctors: string;
              maxCapacity: string;
              noDoctor: string;
              startTime: string;
            };
            cancel: {
              description: string;
              discountDescription: string;
              discountTitle: string;
              title: string;
            };
            checking: string;
            checkError: string;
            error: {
              selectSlot: string;
              timesRequired: string;
            };
            existing: {
              anyDoctor: string;
              anyDoctorDesc: string;
              autoAssign: string;
              description: string;
              loadingDoctors: string;
              noDoctors: string;
              noSlots: string;
              selectDoctor: string;
            };
            header: {
              subtitle: string;
              title: string;
            };
            notLate: string;
            success: {
              adHocCreated: string;
              cancelledWithDiscount: string;
              rebooked: string;
            };
            tabs: {
              adhoc: string;
              cancel: string;
              existing: string;
            };
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
              email: string;
              emailPlaceholder: string;
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
              opening: string;
            };
            toast: {
              accountCreatedEmailSent: string;
              accountCreatedTempPassword: string;
              createSuccess: string;
              invalidQr: string;
              qrExtractSuccess: string;
            };
          };
          paymentConfirmationModal: {
            actions: {
              confirmCash: string;
              goToPayment: string;
            };
            header: {
              order: string;
              title: string;
            };
            methods: {
              cash: string;
              label: string;
              payosQr: string;
            };
            summary: {
              depositPaid: string;
              patient: string;
              remaining: string;
              totalFee: string;
            };
          };
          qrScannerModal: {
            actions: {
              flashOff: string;
              flashOn: string;
              retry: string;
            };
            error: {
              initFailed: string;
              notAllowed: string;
              notFound: string;
            };
            footer: string;
            hint: string;
            loading: string;
            status: {
              error: string;
              initializing: string;
              scanning: string;
              success: string;
            };
            title: string;
          };
        };
      };
    };
    ClinicStaffBilling: {
      page: {
        title: string;
        subtitle: string;
      };
      stats: {
        totalRevenue: string;
        totalRefund: string;
        orders: string;
      };
      filters: {
        all: string;
        completed: string;
        pending: string;
        cancelled: string;
      };
      transactions: {
        title: string;
        emptyTitle: string;
        loadFailed: string;
      };
      status: {
        fullyPaid: string;
        partiallyPaid: string;
      };
      description: {
        medicationAndService: string;
        deposit: string;
        finalPayment: string;
        refund: string;
        methods: {
          Cash: string;
          PayOS: string;
          BankTransfer: string;
        };
      };
      orderDetails: {
        patientLabel: string;
        patientLabelShort: string;
        doctorLabel: string;
        doctorLabelShort: string;
        orderLabel: string;
        noMedication: string;
        medicationCount: string;
        medicinePriceLabel: string;
        serviceFeeLabel: string;
        serviceFeeDescription: string;
        serviceFeeInputLabel: string;
        totalManual: string;
        note: string;
        idLabel: string;
        description: string;
        confirmedDeposit: string;
        walkInFull: string;
        depositOnline: string;
        processing: string;
        confirmFinalPayment: string;
      };
      pagination: {
        previous: string;
        next: string;
        pageOf: string;
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
