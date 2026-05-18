

import CVSearchSection from './CVSearchSection';
import UserCVSection from './UserCVSection';
import ActivityStats from './ActivityStats';
import ProfileHeader from '../my-file/ProfileHeader';

export default function UserProfileSection() {
  return (
    <div className="min-w-4xl mx-auto px-4">
      {/* Profile Header — tự fetch data từ API */}
      <ProfileHeader />

      {/* CV Search/Upload */}
      <CVSearchSection />

      {/* User CVs */}
      <UserCVSection />

      {/* Activity Stats */}
      <ActivityStats />
    </div>
  );
}