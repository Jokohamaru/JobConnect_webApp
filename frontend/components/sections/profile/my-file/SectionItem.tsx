import { Plus } from "lucide-react";
import { Section } from "./sections/types";

interface Props {
  data: any;
  section: Section;
  onClick: () => void;
}

export default function SectionItem({ data, section, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full flex  justify-between px-4 py-3.5 hover:bg-muted/50 transition text-left group bg-white rounded-2xl"
    >
      <div className="flex items-center  gap-2">
        <div>
          <p className="text-xl font-bold mb-2">{section.title}</p>
          <SectionPreview type={section.key} data={data} />
        </div>
      </div>

      <div className="w-6 h-6 border border-blue-400 text-blue-500 flex items-center justify-center rounded-full group-hover:bg-blue-500 group-hover:text-white transition">
        <Plus className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}

function SectionPreview({ type, data }: any) {
  switch (type) {
    case "intro":
      return (
        <div>
          {data.title == "" ? (
            <p className="text-gray-400">
              Giới thiệu điểm mạnh và số năm kinh nghiệm của bạn
            </p>
          ) : (
            <p>{data.title}</p>
          )}
        </div>
      );
    case "edu":
      return (
        <div>
          {data.school == "" ? (
            <p className="text-gray-400">Chia sẻ trình độ học vấn của bạn</p>
          ) : (
            <div className="px-5">
              <p className="font-bold">{data.school}</p>
              <p>
                {data.major} - {data.degree}
              </p>
              <p>
                {data.startYear?.toLocaleDateString()} -{" "}
                {data.endYear?.toLocaleDateString()}
              </p>
              <p>{data.descrip}</p>
            </div>
          )}
        </div>
      );

    case "exp":
      return (
        <div>
          {data.company == "" ? (
            <p className="text-gray-400">
              Thể hiện những thông tin chi tiết về quá trình làm việc
            </p>
          ) : (
            <div className="px-5">
              <p className="font-bold">{data.company}</p>
              <p>{data.position}</p>
              <p>
                {data.startYear?.toLocaleDateString()} -{" "}
                {data.endYear?.toLocaleDateString()}
              </p>
              <p>{data.descrip}</p>
            </div>
          )}
        </div>
      );
    case "skill":
      return (
        <div className="">
          {!data.skillCore || data.skillCore.length === 0 ? (
            <p className="text-gray-400">
              Liệt kê các kỹ năng chuyên môn của bạn
            </p>
          ) : (
            <div className="flex flex-col gap-5 px-5">
              <div className="flex items-center">
                <p className="font-bold">Ký năng chính: </p>
                <div className="ml-2">
                  {data.skillCore.map((s: string) => (
                    <p
                      className="px-4 py-1 rounded-2xl bg-blue-400 text-white"
                      key={s}
                    >
                      {s}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <p className="font-bold">Ký năng mềm: </p>
                <div className="ml-2">
                  {data.skillSoft.map((s: string) => (
                    <p
                      className="px-4 py-1 rounded-2xl bg-blue-400 text-white"
                      key={s}
                    >
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    case "lang":
      return (
        <div>
          {!Array.isArray(data) || data.length === 0 ? (
            <p className="text-gray-400">Liệt kê các ngôn ngữ mà bạn biết</p>
          ) : (
            <div className="px-5 flex gap-4 items-center text-white mt-5">
              {data.map((item: any, i: number) => (
                <p key={i} className="p-2 bg-blue-400 rounded-2xl ">
                  {item.name}({item.level})
                </p>
              ))}
            </div>
          )}
        </div>
      );
    case "proj":
      return (
        <div>
          {data.name === "" ? (
            <p className="text-gray-400">Giới thiệu dự án nổi bật của bạn</p>
          ) : (
            <div className="px-5 mt-5">
              <p>{data.name}</p>
              <p>{data.role}</p>
              <p>
                {data.fromDate?.toLocaleDateString()} -{" "}
                {data.toDate?.toLocaleDateString()}
              </p>
              <p>{data.descrip}</p>
              <p>{data.urlLink}</p>
            </div>
          )}
        </div>
      );
      case "cert":
      return (
        <div>
          {data.name === "" ? (
            <p className="text-gray-400">Bổ sung chứng chỉ liên quan đến kỹ năng của bạn </p>
          ) : (
            <div className="px-5 mt-5">
              <p>{data.name}</p>
              <p>{data.organization}</p>
              <p>
                {data.startYear?.toLocaleDateString()} -{" "}
                {data.endYear?.toLocaleDateString()}
              </p>
              <p>{data.urlLink}</p>
            </div>
          )}
        </div>
      );
      case "award":
      return (
        <div>
          {data.name === "" ? (
            <p className="text-gray-400">Thể hiện giải thưởng hoặc thành tích mà bạn đạt được</p>
          ) : (
            <div className="px-5 mt-5">
              <p>{data.name}</p>
              <p>{data.organization}</p>
              <p>
                {data.year?.toLocaleDateString()}
              </p>
              <p>{data.descrip}</p>
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
}
