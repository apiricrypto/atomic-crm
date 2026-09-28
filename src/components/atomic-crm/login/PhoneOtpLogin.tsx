import { useState } from "react";
import { useNotify, useTranslate } from "ra-core";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getSupabaseClient } from "../providers/supabase/supabase";
import {
  normalizeOtpToken,
  normalizePhoneNumber,
  requestPhoneOtp,
  verifyPhoneOtp,
} from "./phoneOtp";

export function PhoneOtpLogin({ redirectTo }: { redirectTo?: string }) {
  const [mode, setMode] = useState<"closed" | "phone" | "code">("closed");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const notify = useNotify();
  const translate = useTranslate();
  const navigate = useNavigate();

  const fail = () => {
    notify("crm.auth.phone_otp_failed", {
      type: "error",
      messageArgs: { _: "Phone sign-in could not be completed." },
    });
  };

  const requestCode = async () => {
    const normalizedPhone = normalizePhoneNumber(phoneInput);
    if (!normalizedPhone) {
      notify("crm.auth.phone_invalid", {
        type: "warning",
        messageArgs: { _: "Enter a valid mobile number." },
      });
      return;
    }

    setIsPending(true);
    const { error } = await requestPhoneOtp(
      getSupabaseClient().auth,
      normalizedPhone,
    );
    setIsPending(false);

    if (error) {
      fail();
      return;
    }

    setPhone(normalizedPhone);
    setMode("code");
    notify("crm.auth.phone_code_sent", {
      type: "success",
      messageArgs: { _: "If this number is registered, a code was sent." },
    });
  };

  const verifyCode = async () => {
    const token = normalizeOtpToken(tokenInput);
    if (!token) {
      notify("crm.auth.phone_code_invalid", {
        type: "warning",
        messageArgs: { _: "Enter the verification code." },
      });
      return;
    }

    setIsPending(true);
    const { error } = await verifyPhoneOtp(
      getSupabaseClient().auth,
      phone,
      token,
    );
    setIsPending(false);

    if (error) {
      fail();
      return;
    }

    navigate(redirectTo ?? "/", { replace: true });
  };

  if (mode === "closed") {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setMode("phone")}
      >
        {translate("crm.auth.phone_sign_in", {
          _: "Sign in with mobile number",
        })}
      </Button>
    );
  }

  return (
    <div className="space-y-4 rounded-md border p-4" dir="rtl">
      <div className="space-y-2">
        <Label htmlFor={mode === "phone" ? "otp-phone" : "otp-code"}>
          {translate(
            mode === "phone" ? "crm.auth.phone_number" : "crm.auth.phone_code",
          )}
        </Label>
        {mode === "phone" ? (
          <Input
            id="otp-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            value={phoneInput}
            onChange={(event) => setPhoneInput(event.target.value)}
            disabled={isPending}
          />
        ) : (
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="۱۲۳۴۵۶"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            disabled={isPending}
          />
        )}
      </div>
      <Button
        type="button"
        className="w-full"
        disabled={isPending}
        onClick={mode === "phone" ? requestCode : verifyCode}
      >
        {translate(
          mode === "phone"
            ? "crm.auth.phone_send_code"
            : "crm.auth.phone_verify_code",
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={isPending}
        onClick={() => {
          setMode(mode === "code" ? "phone" : "closed");
          setTokenInput("");
        }}
      >
        {translate(
          mode === "code" ? "crm.auth.phone_change" : "ra.action.cancel",
        )}
      </Button>
    </div>
  );
}
