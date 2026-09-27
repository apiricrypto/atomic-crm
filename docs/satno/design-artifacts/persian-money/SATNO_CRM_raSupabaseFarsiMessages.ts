/**
 * Persian messages for ra-supabase.
 *
 * ra-supabase currently publishes official English and French language
 * packages, but no official Persian package. Keep this file local to SATNO so
 * it can be versioned with the CRM and audited when ra-supabase changes.
 */
export const raSupabaseFarsiMessages = {
  "ra-supabase": {
    auth: {
      email: "ایمیل",
      confirm_password: "تأیید رمز عبور",
      sign_in_with: "ورود با %{provider}",
      forgot_password: "رمز عبور را فراموش کرده‌اید؟",
      reset_password: "بازنشانی رمز عبور",
      password_reset:
        "ایمیل بازنشانی رمز عبور برای شما ارسال شد. ایمیل خود را بررسی کنید.",
      missing_tokens: "توکن دسترسی یا نوسازی موجود نیست",
      back_to_login: "بازگشت به ورود",
    },
    reset_password: {
      forgot_password: "رمز عبور را فراموش کرده‌اید؟",
      forgot_password_details:
        "ایمیل خود را وارد کنید تا راهنمای بازنشانی برای شما ارسال شود.",
    },
    set_password: {
      new_password: "رمز عبور جدید را انتخاب کنید",
    },
    validation: {
      password_mismatch: "رمزهای عبور یکسان نیستند",
    },
  },
} as const;
