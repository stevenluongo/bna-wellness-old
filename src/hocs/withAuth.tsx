import { DehydratedState } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export interface WithAuthProps {
  trpcState?: DehydratedState;
}

export default function withAuth<T extends WithAuthProps = WithAuthProps>(
  Component: React.ComponentType<T>
) {
  const ComponentWithAuth = (props: Omit<T, keyof WithAuthProps>) => {
    const router = useRouter();

    const { status } = useSession({
      required: true,
      onUnauthenticated() {
        void signIn();
      },
    });

    const { data: terminal, isLoading } = api.terminal.active.useQuery(
      undefined,
      {
        staleTime: 10000,
      }
    );

    // if we are still loading the session, don't display anything yet
    if (status === "loading" || isLoading) return null;

    //ensure there is an active terminal session
    if (router.pathname != "/terminal" && !terminal) {
      router.push("/terminal");
      return null;
    }

    return <Component {...(props as T)} />;
  };
  return ComponentWithAuth;
}
