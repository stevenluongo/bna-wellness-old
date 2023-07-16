import { DehydratedState } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

export interface WithAuthProps {
  trpcState?: DehydratedState;
}

export default function withAdminAuth<T extends WithAuthProps = WithAuthProps>(
  Component: React.ComponentType<T>
) {
  const ComponentWithAuth = (props: Omit<T, keyof WithAuthProps>) => {
    const router = useRouter();
    const { status, data } = useSession({
      required: true,
      onUnauthenticated() {
        void signIn();
      },
    });

    if (status === "loading") return null;

    if (data.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    return <Component {...(props as T)} />;
  };
  return ComponentWithAuth;
}
