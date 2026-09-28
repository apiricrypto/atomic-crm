export const disableEmailPasswordAuthentication =
  import.meta.env.VITE_DISABLE_EMAIL_PASSWORD_AUTHENTICATION === "true";

// Keep OTP hidden until the Supabase phone provider / Send SMS Hook has been
// configured and a real delivery test has passed for the target environment.
export const enablePhoneOtpAuthentication =
  import.meta.env.VITE_ENABLE_PHONE_OTP_AUTHENTICATION === "true";

export const googleWorkplaceDomain: string | undefined = import.meta.env
  .VITE_GOOGLE_WORKPLACE_DOMAIN;
