interface ProfileHearderProps {
  nameUser: string;
}

export default function ProfileHeader({ nameUser }: ProfileHearderProps) {
  return (
    <div className="bg-white px-10 pt-4 pb-15 rounded-2xl shadow-sm">
      <div className="flex items-center">
        <div className="w-8 h-8"> 
          <img src="/images/hi.png" alt="" />
        </div>
        <p className="text-2xl">Xin chào</p>
      </div>
      <p className="font-bold text-2xl">{nameUser}</p>
    </div>
  );
}
