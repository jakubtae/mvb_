"use client";
import CardWrapper from "./CardWrapper";

const LoginForm = () => {
  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <h3 className="text-center font-semibold">
        Please use the below options to login
      </h3>
    </CardWrapper>
  );
};

export default LoginForm;
