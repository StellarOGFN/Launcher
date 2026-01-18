import { Stellar } from "@/stellar";
import { create } from "zustand";
import { useRoutingStore } from "./RoutingStore";
import { IMCPProfile } from "@/stellar/interfaces/IMCPProfile";
import { IAccount } from "@/stellar/interfaces/IAccount";

type AuthStore = {
  jwt: string | null;
  base: string | null;
  account: IAccount | null;
  athena: IMCPProfile | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  init: () => Promise<boolean>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  jwt: Stellar.Storage.get<string>("auth.jwt") ?? null,
  base: Stellar.Storage.get<string>("auth.base") ?? null,
  account: Stellar.Storage.get<IAccount>("auth.account") ?? null,
  athena: Stellar.Storage.get<IMCPProfile>("auth.athena") ?? null,
  init: async () => {
    const Routing = useRoutingStore.getState();
    const r = Routing.Routes.get("account");

    Stellar.Storage.set("auth.base", r ? r.url : null);
    set({ base: r ? r.url : null });

    // await Stellar.Requests.get<{
    //   account: IAccount;
    //   athena: IMCPProfile;
    // }>(get().base ?? "", {
    //   Authorization: `bearer ${get().jwt}`,
    // }).then((res) => {
    //   if (res.ok) {
    //     Stellar.Storage.set("auth.account", res.data.account);
    //     Stellar.Storage.set("auth.athena", res.data.athena);
    //     set({
    //       account: res.data.account,
    //       athena: res.data.athena,
    //     });
    //   } else {
    //     set({ jwt: null });
    //     set({ account: null });
    //     console.log(res.data);
    //   }
    // });

    // if (get().account != null) {
    //   return true;
    // }

    return get().account != null;
  },
  login: async (token: string) => {
    Stellar.Storage.set("auth.jwt", token);
    set({ jwt: token });

    await Stellar.Requests.get<{
      account: IAccount;
      athena: IMCPProfile;
    }>(get().base ?? "", {
      Authorization: `bearer ${token}`,
    }).then((res) => {
      if (res.ok) {
        Stellar.Storage.set("auth.account", res.data.account);
        Stellar.Storage.set("auth.athena", res.data.athena);
        set({
          account: res.data.account,
          athena: res.data.athena,
        });
      } else {
        set({ jwt: null });
        set({ account: null });
        console.log(res.data);
      }
    });

    if (get().account != null) {
      return true;
    }

    return false;
  },
  logout: () => {
    Stellar.Storage.remove("auth.jwt");
    Stellar.Storage.remove("auth.account");
    Stellar.Storage.remove("auth.athena");

    set({
      jwt: null,
      account: null,
      athena: null,
    });
  },
}));
