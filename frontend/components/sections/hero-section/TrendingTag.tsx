import Link from "next/link";

export function TrendingTag() {
  return (
    <div className="flex items-center gap-3 text-[13px] flex-wrap justify-center">
      <span className="bg-[#0b4a85] text-white font-medium px-4 py-1.5 rounded-full">Xu hướng hiện nay:</span>

      {["IT", "Tài chính - ngân hàng", "Marketing", "Chăm sóc khách hàng"].map(
        (item) => (
          <Link
            href=""
            key={item}
            className="bg-white px-4 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            {item}
          </Link>
        ),
      )}
    </div>
  );
}
