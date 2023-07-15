import { DehydratedState } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";

export interface WithAuthProps {
  trpcState?: DehydratedState;
}

export default function withAuth<T extends WithAuthProps = WithAuthProps>(
  Component: React.ComponentType<T>
) {
  const ComponentWithAuth = (props: Omit<T, keyof WithAuthProps>) => {
    const { status, data } = useSession({
      required: true,
      onUnauthenticated() {
        void signIn();
      },
    });

    if (status === "loading") return null;

    console.log(data);

    return <Component {...(props as T)} />;
  };
  return ComponentWithAuth;
}
