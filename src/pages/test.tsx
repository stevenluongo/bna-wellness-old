import { type NextPage } from "next";

import { api } from "~/utils/api";

const Register: NextPage = () => {
  const registerMutation = api.auth.register.useMutation({
    onSuccess(payload) {
      console.log(payload);
    },
    onError(error) {
      console.log(error);
    },
  });

  return (
    <button
      onClick={() =>
        registerMutation.mutate({
          username: "admin",
          password: "admin",
          firstName: "admin",
          lastName: "admin",
          role: "ADMIN",
        })
      }
    >
      Generate Admin User
    </button>
  );
};

export default Register;
