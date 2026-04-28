import Link from "next/link";

export function TrendingTag() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-blue-800 font-medium">Xu hướng hiện nay:</span>

      {["IT", "Tài chính - ngân hàng", "Marketing", "Chăm sóc khách hàng"].map(
        (item) => (
          <Link
            href=""
            key={item}
            className="bg-white px-4 py-2 rounded-full text-gray-700 hover:bg-[#0E7BC3] hover:text-white font-semibold"
          >
            {item}
          </Link>
        ),
      )}
    </div>
  );
}
