import { CVSections } from "./CVSections";
import ProfileHeader from "./ProfileHeader";



export default function MyFileSection() {
  return (
    <div className="min-w-4xl mx-auto px-4">
      <ProfileHeader />
      <div className="flex flex-col gap-4">
        <CVSections />
      </div>
    </div>
  );
}
