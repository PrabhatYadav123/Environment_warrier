import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-forest text-white">
            <Leaf size={20} />
          </span>
          <div>
            <p className="font-bold">Environment Warrior Group</p>
            <p className="text-sm text-ink/65">Stories, campaigns and community action for a cleaner planet.</p>
          </div>
        </div>
        <p className="text-sm text-ink/60">Built with React, Express, MongoDB and Cloudinary.</p>
      </div>
    </footer>
  );
}
