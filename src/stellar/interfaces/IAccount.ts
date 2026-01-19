export interface IAccount {
  Created: string;
  AccountID: string;
  Email: string;
  Password: string;
  DisplayName: string;
  DiscordID: string;
  IsBanned: boolean;
  Roles: string[];
  Rewards: string[];
  ProfilePicture: string;
  DisplayNameChanges: number;
}
