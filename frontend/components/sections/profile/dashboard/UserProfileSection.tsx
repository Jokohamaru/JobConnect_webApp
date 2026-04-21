
import ProfileHeader from './ProfileHeader';
import CVSearchSection from './CVSearchSection';
import UserCVSection from './UserCVSection';
import ActivityStats from './ActivityStats';

interface UserProfileSectionProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function UserProfileSection({ user }: UserProfileSectionProps) {
  return (
    <div className="min-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <ProfileHeader
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      {/* CV Search/Upload */}
      <CVSearchSection />

      {/* User CVs */}
      <UserCVSection id={0} title={''} thumbnail={''} />

      {/* Activity Stats */}
      <ActivityStats />
    </div>
  );
}