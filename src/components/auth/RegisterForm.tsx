"use client";
import CardWrapper from "./CardWrapper";

const RegisterForm = () => {
  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <h3 className="text-center font-semibold">
        Please use the below options to register
      </h3>
    </CardWrapper>
  );
};

export default RegisterForm;
