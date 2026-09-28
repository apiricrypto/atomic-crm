export const englishCrmMessages = {
  resources: {
    companies: {
      name: "Company |||| Companies",
      forcedCaseName: "Company",
      fields: {
        name: "Company name",
        website: "Website",
        linkedin_url: "LinkedIn URL",
        phone_number: "Phone number",
        created_at: "Created at",
        nb_contacts: "Number of contacts",
        revenue: "Revenue",
        sector: "Sector",
        size: "Size",
        tax_identifier: "Tax Identifier",
        address: "Address",
        city: "City",
        zipcode: "Zip code",
        state_abbr: "State",
        country: "Country",
        description: "Description",
        context_links: "Context links",
        sales_id: "Account manager",
      },
      empty: {
        description: "It seems your company list is empty.",
        title: "No companies found",
      },
      import: {
        title: "Import companies",
      },
      field_categories: {
        contact: "Contact",
        additional_info: "Additional information",
        address: "Address",
        context: "Context",
      },
      action: {
        create: "Create Company",
        edit: "Edit company",
        new: "New Company",
        show: "Show company",
      },
      added_on: "Added on %{date}",
      followed_by: "Followed by %{name}",
      followed_by_you: "Followed by you",
      no_contacts: "No contact",
      nb_contacts: "%{smart_count} contact |||| %{smart_count} contacts",
      nb_deals: "%{smart_count} deal |||| %{smart_count} deals",
      sizes: {
        one_employee: "1 employee",
        two_to_nine_employees: "2-9 employees",
        ten_to_forty_nine_employees: "10-49 employees",
        fifty_to_two_hundred_forty_nine_employees: "50-249 employees",
        two_hundred_fifty_or_more_employees: "250 or more employees",
      },
      autocomplete: {
        create_error: "An error occurred while creating the company",
        create_item: "Create %{item}",
        create_label: "Start typing to create a new company",
      },
    },
    contacts: {
      name: "Contact |||| Contacts",
      forcedCaseName: "Contact",
      field_categories: {
        background_info: "Background info",
        identity: "Identity",
        misc: "Misc",
        personal_info: "Personal info",
        position: "Position",
      },
      fields: {
        first_name: "First name",
        last_name: "Last name",
        last_seen: "Last seen",
        title: "Title",
        company_id: "Company",
        email_jsonb: "Email addresses",
        email: "Email",
        phone_jsonb: "Phone numbers",
        phone_number: "Phone number",
        linkedin_url: "LinkedIn URL",
        background: "Background info (bio, how you met, etc)",
        has_newsletter: "Has newsletter",
        sales_id: "Account manager",
      },
      action: {
        add: "Add contact",
        add_first: "Add your first contact",
        create: "Create contact",
        edit: "Edit contact",
        export_vcard: "Export to vCard",
        new: "New Contact",
        show: "Show contact",
      },
      background: {
        last_activity_on: "Last activity on %{date}",
        added_on: "Added on %{date}",
        followed_by: "Followed by %{name}",
        followed_by_you: "Followed by you",
        status_none: "None",
      },
      position_at: "%{title} at",
      position_at_company: "%{title} at %{company}",
      empty: {
        description: "It seems your contact list is empty.",
        title: "No contacts found",
      },
      import: {
        title: "Import contacts",
      },
      inputs: {
        genders: {
          male: "He/Him",
          female: "She/Her",
          nonbinary: "They/Them",
        },
        personal_info_types: {
          work: "Work",
          home: "Home",
          other: "Other",
        },
      },
      list: {
        error_loading: "Error loading contacts",
      },
      bulk_tag: {
        action: "Tag",
        back: "Back to tags",
        create_description:
          "Create a new tag and apply it to the selected contacts.",
        description:
          "Choose an existing tag or create a new one for the selected contacts.",
        empty: "No tags yet. Create one to tag the selected contacts.",
        error: "Failed to add tag to contacts",
        noop: "Selected contacts already have this tag",
        success:
          "Tag added to %{smart_count} contact |||| Tag added to %{smart_count} contacts",
        title: "Add tag to contacts",
      },
      merge: {
        action: "Merge with another contact",
        confirm: "Merge Contacts",
        current_contact: "Current Contact (will be deleted)",
        description: "Merge this contact with another one.",
        error: "Failed to merge contacts",
        merging: "Merging...",
        no_additional_data: "No additional data to merge",
        select_target: "Please select a contact to merge with",
        success: "Contacts merged successfully",
        target_contact: "Target Contact (will be kept)",
        title: "Merge Contact",
        warning_description:
          "All data will be transferred to the second contact. This action cannot be undone.",
        warning_title: "Warning: Destructive Operation",
        what_will_be_merged: "What will be merged:",
      },
      filters: {
        before_last_month: "Before last month",
        before_this_month: "Before this month",
        before_this_week: "Before this week",
        managed_by_me: "Managed by me",
        search: "Search name, company...",
        this_week: "This week",
        today: "Today",
        tags: "Tags",
        tasks: "Tasks",
      },
      hot: {
        empty_change_status:
          'Change the status of a contact by adding a note to that contact and clicking on "show options".',
        empty_hint: 'Contacts with a "hot" status will appear here.',
        title: "Hot Contacts",
      },
    },
    deals: {
      name: "Deal |||| Deals",
      fields: {
        name: "Name",
        description: "Description",
        company_id: "Company",
        contact_ids: "Contacts",
        category: "Category",
        amount: "Budget",
        expected_closing_date: "Expected closing date",
        stage: "Stage",
      },
      action: {
        back_to_deal: "Back to deal",
        create: "Create deal",
        new: "New Deal",
      },
      field_categories: {
        misc: "Misc",
      },
      filters: {
        only_mine: "Only deals I manage",
      },
      archived: {
        action: "Archive",
        error: "Error: deal not archived",
        list_title: "Archived Deals",
        success: "Deal archived",
        title: "Archived Deal",
        view: "View archived deals",
      },
      inputs: {
        linked_to: "Linked to",
      },
      unarchived: {
        action: "Send back to the board",
        error: "Error: deal not unarchived",
        success: "Deal unarchived",
      },
      updated: "Deal updated",
      empty: {
        before_create: "before creating a deal.",
        description: "It seems your deal list is empty.",
        title: "No deals found",
      },
      import: {
        title: "Import deals",
      },
      invalid_date: "Invalid date",
    },
    lead_inbox: {
      name: "Lead |||| Lead Inbox",
      forcedCaseName: "Lead",
      subtitle: "Review inbound leads and explicitly convert qualified records",
      open: "Open lead inbox",
      empty: "No lead has entered the inbox yet.",
      unknown_organization: "Unknown organization",
      quarantine_notice:
        "A raw lead is not a Company, Contact, or Deal. Only an explicit transactional conversion may create core CRM records.",
      triage_score: "Review score %{score}",
      open_source: "Open source",
      status_updated: "Lead status updated",
      converted: "Lead converted with provenance preserved",
      fields: {
        status: "Lead status",
        location: "Location",
        deadline: "Deadline",
        contact: "Contact channel",
        estimated_amount: "Raw estimate",
      },
      summary: {
        active: "In review",
        qualified: "Qualified",
        converted: "Converted",
      },
      source: {
        tender_radar: "Tender Radar",
        bale_market: "Bale Market",
        website: "Website",
        manual: "Manual",
        import: "File import",
      },
      status: {
        new: "New",
        reviewing: "Reviewing",
        qualified: "Qualified",
        rejected: "Rejected",
        converted: "Converted",
      },
      priority: {
        low: "Low",
        normal: "Normal",
        high: "High",
        urgent: "Urgent",
      },
      action: {
        convert: "Convert to opportunity",
        review_tender: "Review in Tender Intelligence",
      },
      conversion: {
        title: "Convert lead to opportunity",
        description:
          "Review these fields. A successful operation creates the Company and Deal, plus a Contact when supplied, in one transaction.",
        company_name: "Company name",
        deal_name: "Opportunity name",
        first_name: "Contact first name",
        last_name: "Contact last name",
        email: "Contact email",
        phone: "Contact phone",
        amount: "Opportunity amount",
        closing_date: "Expected closing date",
        deal_description: "Opportunity description",
        confirm:
          "I reviewed the fields and approve creating core CRM records. Raw payload and the initial estimate are not copied automatically.",
      },
    },
    tender_intelligence: {
      name: "Tender & Inquiry Intelligence",
      short_name: "Tenders",
      subtitle:
        "Receive Radar leads, verify against official SETAD data, and track each decision to its outcome",
      tabs: {
        radar: "Radar Inbox",
        setad: "Interactive SETAD Search",
        pipeline: "Tender Pipeline",
        saved_searches: "Saved Searches",
      },
      fields: {
        domain: "Domain",
        type: "Opportunity type",
      },
      type: {
        inquiry: "Inquiry",
        tender: "Tender",
      },
      domain: {
        renewable_energy: "Renewable energy",
        security_systems: "Security systems",
      },
      verification: {
        setad_verified: "SETAD Verified",
        pending_setad_verification: "Pending SETAD Verification",
        data_conflict: "Data Conflict",
      },
      radar: {
        title: "Radar Inbox",
        contract_notice:
          "Only reviewed A/B records are import candidates; retries must be idempotent and official provenance must be retained.",
        quarantine:
          "This is still a quarantined lead, not a Company, Contact, or Deal.",
        empty: "No Tender Radar record has arrived yet.",
        grade_score: "Grade %{grade} • score %{score}",
        review_import: "Review and import",
        qualify_first: "Qualify in Lead Inbox first",
        not_importable: "Outside the A/B import queue",
        imported: "Tender opportunity imported with provenance preserved",
        already_imported: "This lead was already imported without overwrite",
      },
      review: {
        title: "Human review before import",
        description:
          "Only the allow-listed fields below reach the guarded import path; raw provider data and source snapshots remain quarantined.",
        pending_notice:
          "Radar assertions default to unverified. Select SETAD Verified only after manually checking the official page.",
        radar_record_id: "Radar aggregator record ID",
        grade: "Radar grade",
        score: "Radar score",
        open_setad: "Open official SETAD page",
        verified_identifier_required:
          "SETAD Verified requires the official identifier matching the opportunity type.",
        confirm:
          "I reviewed these fields and approve guarded import into Tender Pipeline. This does not create a Company, Contact, Deal, or Project.",
        import: "Import to Tender Pipeline",
        fields: {
          title: "Reviewed title",
          description: "Reviewed description",
          organizer: "Organizer",
          province: "Province",
          city: "City",
          need_no: "Official Need No",
          tender_no: "Official Tender No",
          publish_date: "Official publication date",
          document_deadline: "Document deadline",
          submission_deadline: "Submission deadline",
          verification: "Verification status",
          official_url: "Official SETAD URL",
          trade: "Trade",
          category: "Category",
        },
      },
      setad: {
        title: "Human-assisted official SETAD search",
        human_notice:
          "Login, OTP, and CAPTCHA are completed only by the user in the browser; the product never solves, bypasses, or stores them.",
      },
      pipeline: {
        title: "Tender Pipeline",
        notice:
          "Documents, technical review, pricing, participation decision, and result are recorded separately and never auto-create a Deal or Project.",
        documents: "Documents",
        technical_review: "Technical review",
        pricing: "Pricing",
        participation_decision: "Bid / No bid",
        result: "Result",
      },
      saved_searches: {
        title: "Saved Searches",
        notice:
          "These are examples only; saved profiles retain the user's full custom filter set.",
        example: "Starter example",
      },
    },
    projects: {
      name: "Project |||| Projects",
      forcedCaseName: "Project",
      costing_subtitle: "Contract value, costs, and forecast margin",
      count: "%{smart_count} project |||| %{smart_count} projects",
      empty: "No project has been created from a won deal yet.",
      fields: {
        contract_amount: "Contract value",
        planned_cost: "Planned cost",
        actual_cost: "Actual cost",
        forecast_margin: "Forecast margin",
      },
      status: {
        planned: "Planned",
        active: "Active",
        on_hold: "On hold",
        completed: "Completed",
        cancelled: "Cancelled",
      },
    },
    procurement_commitments: {
      name: "Purchase commitment |||| Project procurement",
      forcedCaseName: "Purchase commitment",
      subtitle: "Track orders and commitments linked to project cost items",
      empty: "No procurement commitment has been recorded yet.",
      mixed_currency: "Multiple currencies",
      accounting_notice:
        "These amounts are not payments or actual costs; payments and actual costs are recorded in separate financial workflows.",
      fields: {
        amount: "Committed amount",
        supplier: "Supplier",
        expected_on: "Expected date",
      },
      summary: {
        active: "Active commitment",
        received: "Received",
        draft: "Draft",
      },
      status: {
        draft: "Draft",
        approved: "Approved",
        ordered: "Ordered",
        received: "Received",
        cancelled: "Cancelled",
      },
    },
    finance: {
      name: "Finance",
      subtitle:
        "Receivables, payables, and recorded cash movements by currency",
      empty: "No financial obligation or transaction has been recorded yet.",
      accounting_notice:
        "Project contract values and procurement commitments never create receivables, payables, or payments automatically. Only explicit financial records affect these balances.",
      recent_transactions: "Recent transactions",
      summary: {
        receivable: "Receivable outstanding",
        payable: "Payable outstanding",
        net_cash_flow: "Recorded net cash flow",
        transactions: "Recorded transactions",
        overdue:
          "%{smart_count} overdue item |||| %{smart_count} overdue items",
      },
      direction: {
        inflow: "Inflow",
        outflow: "Outflow",
      },
    },
    inventory: {
      name: "Inventory",
      subtitle: "Stock items and explicit warehouse movements",
      empty: "No inventory item has been defined yet.",
      accounting_notice:
        "Procurement receiving never changes stock automatically. Stock changes only through an explicit receipt, issue, or adjustment; quantities are not financial costs or payments.",
      recent_movements: "Recent movements",
      fields: {
        on_hand: "On hand",
        reorder_level: "Reorder level",
      },
      summary: {
        active_items: "Active items",
        low_stock: "At or below reorder level",
        negative_stock: "Negative stock",
      },
      status: {
        available: "Available",
        low: "Low stock",
        negative: "Negative stock",
      },
      movement: {
        receipt: "Receipt",
        issue: "Issue",
        adjustment_in: "Positive adjustment",
        adjustment_out: "Negative adjustment",
      },
      unit: {
        piece: "pcs",
        meter: "m",
        kilogram: "kg",
        liter: "L",
        set: "sets",
        other: "units",
      },
    },
    notes: {
      name: "Note |||| Notes",
      forcedCaseName: "Note",
      fields: {
        status: "Status",
        date: "Date",
        attachments: "Attachments",
        contact_id: "Contact",
        deal_id: "Deal",
      },
      action: {
        add: "Add note",
        add_first: "Add your first note",
        delete: "Delete note",
        edit: "Edit note",
        update: "Update note",
        add_this: "Add this note",
      },
      sheet: {
        create: "Create note",
        create_for: "Create note for %{name}",
        edit: "Edit note",
        edit_for: "Edit note for %{name}",
      },
      deleted: "Note deleted",
      empty: "No notes yet",
      author_added: "%{name} added a note",
      you_added: "You added a note",
      me: "Me",
      list: {
        error_loading: "Error loading notes",
      },
      note_for_contact: "Note for %{name}",
      stepper: {
        hint: "Go to a contact page and add a note",
      },
      added: "Note added",
      inputs: {
        add_note: "Add a note",
        options_hint: "(attach files, or change details)",
        show_options: "Show options",
      },
      actions: {
        attach_document: "Attach document",
      },
      validation: {
        note_or_attachment_required: "A note or an attachment is required",
      },
    },
    daily_work_reports: {
      name: "Daily work report |||| Daily work reports",
      subtitle: "One accountable report per staff member and work day",
      empty: "No daily work report has been recorded yet.",
      create_title: "Create daily work report",
      edit_title: "Edit daily work report",
      open: "Open daily work reports",
      owner_only: "Only the report owner can edit this record.",
      duration: "%{hours} h %{minutes} min",
      minutes_help: "Total time from 0 to 1,440 minutes",
      achievements_help: "Summarize completed work and concrete outcomes.",
      blockers_help: "Record blockers that need attention, if any.",
      next_steps_help: "Record the next planned actions, if any.",
      fields: {
        sales_id: "Staff member",
        work_date: "Work date",
        achievements: "Completed work",
        blockers: "Blockers",
        next_steps: "Next steps",
        minutes_worked: "Time worked (minutes)",
        created_at: "Created at",
      },
      action: {
        create: "New daily report",
        edit: "Edit report",
      },
    },
    sales: {
      name: "User |||| Users",
      fields: {
        first_name: "First name",
        last_name: "Last name",
        email: "Email",
        phone: "Sign-in mobile number",
        secondary_email: "Secondary email",
        secondary_emails: "Secondary emails",
        role: "Role",
        administrator: "Admin",
        disabled: "Disabled",
      },
      phone_help:
        "Stored in international format; only an administrator may change it.",
      roles: {
        admin: "Administrator",
        manager: "Manager",
        sales: "Sales",
        project: "Project",
        finance: "Finance",
        inventory: "Inventory",
        viewer: "Viewer",
      },
      create: {
        error: "An error occurred while creating the user.",
        success:
          "User created. They will soon receive an email to set their password.",
        title: "Create a new user",
      },
      edit: {
        error: "An error occurred. Please try again.",
        record_not_found: "Record not found",
        success: "User updated successfully",
        title: "Edit %{name}",
      },
      action: {
        new: "New user",
      },
    },
    tasks: {
      name: "Task |||| Tasks",
      forcedCaseName: "Task",
      fields: {
        text: "Description",
        due_date: "Due date",
        type: "Type",
        contact_id: "Contact",
        due_short: "due",
      },
      action: {
        add: "Add task",
        create: "Create task",
        edit: "Edit task",
      },
      actions: {
        postpone_next_week: "Postpone to next week",
        postpone_tomorrow: "Postpone to tomorrow",
        title: "task actions",
      },
      added: "Task added",
      deleted: "Task deleted successfully",
      dialog: {
        create: "Create task",
        create_for: "Create task for %{name}",
      },
      sheet: {
        edit: "Edit task",
        edit_for: "Edit task for %{name}",
      },
      empty: "No tasks yet",
      empty_list_hint: "Tasks added to your contacts will appear here.",
      filters: {
        later: "Later",
        overdue: "Overdue",
        this_week: "This week",
        today: "Today",
        tomorrow: "Tomorrow",
        with_pending: "With pending tasks",
      },
      regarding_contact: "(Re: %{name})",
      updated: "Task updated",
    },
    tags: {
      name: "Tag |||| Tags",
      action: {
        add: "Add tag",
        create: "Create new tag",
      },
      dialog: {
        color: "Color",
        create_title: "Create a new tag",
        edit_title: "Edit tag",
        name_label: "Tag name",
        name_placeholder: "Enter tag name",
      },
    },
  },
  crm: {
    action: {
      reset_password: "Reset Password",
    },
    auth: {
      first_name: "First name",
      last_name: "Last name",
      confirm_password: "Confirm password",
      confirmation_required:
        "Please follow the link we just sent you by email to confirm your account.",
      recovery_email_sent:
        "If you're a registered user, you should receive a password recovery email shortly.",
      sign_in_failed: "Failed to log in.",
      sign_in_google_workspace: "Sign in with Google Workplace",
      phone_sign_in: "Sign in with mobile number",
      phone_number: "Mobile number",
      phone_send_code: "Send sign-in code",
      phone_code: "Verification code",
      phone_verify_code: "Verify and sign in",
      phone_change: "Change mobile number",
      phone_code_sent:
        "If this number belongs to an active user, a sign-in code was sent.",
      phone_invalid: "Enter a valid mobile number.",
      phone_code_invalid: "Enter a valid verification code.",
      phone_otp_failed: "Phone sign-in could not be completed.",
      phone_taken: "This mobile number is already assigned to another user.",
      phone_admin_only:
        "Only an administrator may change a sign-in mobile number.",
      phone_clear_not_supported:
        "A sign-in number may be replaced; removing it requires administrator recovery.",
      signup: {
        create_account: "Create account",
        create_first_user:
          "Create the first user account to complete the setup.",
        creating: "Creating...",
        initial_user_created: "Initial user successfully created",
      },
      welcome_title: "Welcome to Atomic CRM",
    },
    common: {
      account_manager: "Account manager",
      activity: "Activity",
      added: "added",
      details: "Details",
      last_activity_with_date: "last activity %{date}",
      load_more: "Load more",
      misc: "Misc",
      past: "Past",
      read_more: "Read more",
      retry: "Retry",
      show_less: "Show less",
      copied: "Copied!",
      copy: "Copy",
      loading: "Loading...",
      me: "Me",
      task_count: "%{smart_count} task |||| %{smart_count} tasks",
    },
    changelog: {
      title: "Changelog",
    },
    activity: {
      added_company: "%{name} added company",
      you_added_company: "You added company",
      added_contact: "%{name} added",
      you_added_contact: "You added",
      added_note: "%{name} added a note about",
      you_added_note: "You added a note about",
      added_note_about_deal: "%{name} added a note about deal",
      you_added_note_about_deal: "You added a note about deal",
      added_deal: "%{name} added deal",
      you_added_deal: "You added deal",
      at_company: "at",
      to: "to",
      load_more: "Load more activity",
    },
    dashboard: {
      deals_chart: "Upcoming Deal Revenue",
      deals_pipeline: "Deals Pipeline",
      latest_activity: "Latest Activity",
      latest_activity_error: "Error loading latest activity",
      latest_notes: "My Latest Notes",
      latest_notes_added_ago: "added %{timeAgo}",
      stepper: {
        install: "Install Atomic CRM",
        progress: "%{step}/3 done",
        whats_next: "What's next?",
      },
      upcoming_tasks: "Upcoming Tasks",
    },
    data_import: {
      button: "Import CSV",
      complete:
        "Import complete. Imported %{importCount} records, with %{errorCount} errors",
      csv_file: "CSV File",
      error:
        "Failed to import this file, please make sure you provided a valid CSV file.",
      in_progress: "Import in progress…",
      progress:
        "Imported %{importCount} / %{rowCount} records, with %{errorCount} errors.",
      remaining_time: "Estimated remaining time:",
      resource: "Resource",
      sample_download: "Download CSV sample",
      sample_hint: "Here is a sample CSV file you can use as a template",
      start: "Start import",
      stop: "Stop import",
      stopped:
        "Import stopped. Imported %{importCount} records, with %{errorCount} errors",
      title: "Import data",
    },
    header: {
      import_data: "Import from JSON",
    },
    image_editor: {
      change: "Change",
      drop_hint: "Drop a file to upload, or click to select it.",
      editable_content: "Editable content",
      title: "Upload and resize image",
      update_image: "Update Image",
    },
    import: {
      action: {
        download_error_report: "Download the error report",
        import: "Import",
        import_another: "Import another file",
      },
      error: {
        unable: "Unable to import this file.",
      },
      idle: {
        description_1:
          "You can import sales, companies, contacts, companies, notes, and tasks.",
        description_2:
          "Data must be in a JSON file matching the following sample:",
      },
      status: {
        all_success: "All records were imported successfully.",
        complete: "Import complete.",
        failed: "Failed",
        imported: "Imported",
        in_progress:
          "Import in progress, please don't navigate away from this page.",
        some_failed: "Some records were not imported.",
        table_caption: "Import status",
      },
      title: "Import from JSON",
    },
    settings: {
      about: "About",
      companies: {
        sectors: "Sectors",
      },
      dark_mode_logo: "Dark Mode Logo",
      deals: {
        categories: "Categories",
        currency: "Currency",
        pipeline_help:
          "Select which deal stages should count as pipeline deals.",
        pipeline_statuses: "Pipeline Statuses",
        stages: "Stages",
      },
      light_mode_logo: "Light Mode Logo",
      notes: {
        statuses: "Statuses",
      },
      reset_defaults: "Reset to Defaults",
      save_error: "Failed to save configuration",
      saved: "Configuration saved successfully",
      saving: "Saving...",
      tasks: {
        types: "Types",
      },
      preferences: "Preferences",
      title: "Settings",
      app_title: "App Title",
      sections: {
        branding: "Branding",
      },
      validation: {
        duplicate: "Duplicate %{display_name}: %{items}",
        in_use:
          "Cannot remove %{display_name} that are still used by deals: %{items}",
        validating: "Validating\u2026",
        entities: {
          categories: "categories",
          stages: "stages",
        },
      },
    },
    theme: {
      dark: "Dark",
      label: "Theme",
      light: "Light",
      system: "System",
    },
    language: "Language",
    navigation: {
      label: "CRM navigation",
    },
    profile: {
      add_secondary_email: "Add an email",
      email_taken: "%{email} is already used by another user",
      no_secondary_emails: "None",
      secondary_email_invalid: "%{email} is not a valid email address",
      secondary_email_is_primary: "%{email} is already your main address",
      secondary_email_taken: "%{email} is already used by another user",
      too_many_secondary_emails:
        "You cannot add more than 10 secondary email addresses",
      secondary_emails_help:
        "Other addresses you send emails from. Leave one empty to remove it.",
      inbound: {
        description:
          "You can start sending emails to your server's inbound email address, e.g. by adding it to the %{field} field. Atomic CRM will process the emails and add notes to the corresponding contacts.",
        title: "Inbound email",
      },
      mcp: {
        title: "MCP Server",
        description:
          "Use this URL to connect your AI assistant to your CRM data via the Model Context Protocol (MCP).",
      },
      password: {
        change: "Change password",
      },
      password_reset_sent:
        "A reset password email has been sent to your email address",
      record_not_found: "Record not found",
      title: "Profile",
      updated: "Your profile has been updated",
      update_error: "An error occurred. Please try again",
    },
    validation: {
      invalid_url: "Must be a valid URL",
      invalid_linkedin_url: "URL must be from linkedin.com",
    },
  },
} as const;

type MessageSchema<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? MessageSchema<T[K]>
      : never;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? DeepPartial<T[K]>
    : T[K];
};

export type CrmMessages = MessageSchema<typeof englishCrmMessages>;
export type PartialCrmMessages = DeepPartial<CrmMessages>;
