import { create } from "zustand";
import { useRoutingStore } from "./RoutingStore";

interface MonthlyReward {
  Id: string;
  AccountId: string;
  Month: number;
  Year: number;
  Rank: number;
  Hype: number;
  Claimed: boolean;
  CreatedAt: string;
}

interface RewardsState {
  rewards: MonthlyReward[];
  loading: boolean;
  showModal: boolean;
  claiming: boolean;

  fetchRewards: (accountId: string, jwt: string) => Promise<void>;
  closeModal: () => void;
  claimReward: (
    rewardId: string,
    rank: number,
    jwt: string,
  ) => Promise<boolean>;
  reset: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  rewards: [],
  loading: true,
  showModal: false,
  claiming: false,

  fetchRewards: async (accountId: string, jwt: string) => {
    set({ loading: true });

    const Routing = useRoutingStore.getState();
    console.log(Routing.Routes);
    const rewardsRoute = Routing.Routes.get("rewards");
    if (!rewardsRoute) {
      console.error("Rewards route not found");
      set({ loading: false });
      return;
    }

    try {
      const response = await fetch(`${rewardsRoute.url}/${accountId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!response.ok) throw new Error("Failed to fetch rewards");

      const data = await response.json();
      const unclaimedRewards = data.rewards.filter(
        (reward: MonthlyReward) => !reward.Claimed,
      );

      if (unclaimedRewards.length > 0) {
        const modalKey = `reward_modal_shown_${accountId}_${unclaimedRewards[0].Month}_${unclaimedRewards[0].Year}`;
        const modalShown = localStorage.getItem(modalKey);

        if (!modalShown) {
          set({ rewards: unclaimedRewards, showModal: true });
        } else {
          set({ rewards: unclaimedRewards });
        }
      } else {
        set({ rewards: unclaimedRewards });
      }
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
      set({ rewards: [] });
    } finally {
      set({ loading: false });
    }
  },

  claimReward: async (rewardId: string, rank: number, jwt: string) => {
    set({ claiming: true });

    const Routing = useRoutingStore.getState();
    const rewardsRoute = Routing.Routes.get("rewards");
    if (!rewardsRoute) {
      console.error("Rewards route not found");
      set({ claiming: false });
      throw new Error("Rewards route not found");
    }

    try {
      const response = await fetch(`${rewardsRoute.url}/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId, rank }),
      });

      if (!response.ok) throw new Error("Failed to claim reward");

      const { rewards } = get();
      if (rewards.length > 0) {
        const modalKey = `reward_modal_shown_${rewards[0].AccountId}_${rewards[0].Month}_${rewards[0].Year}`;
        localStorage.setItem(modalKey, "true");
      }

      set({ showModal: false, claiming: false });
      return true;
    } catch (err) {
      console.error("Failed to claim reward:", err);
      set({ claiming: false });
      return false;
    }
  },

  closeModal: () => set({ showModal: false }),

  reset: () =>
    set({
      rewards: [],
      loading: true,
      showModal: false,
      claiming: false,
    }),
}));
