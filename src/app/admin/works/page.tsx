import { createClient } from "@/supabase/server";
import WorkForm from "@/components/WorkForm";
import type { WorkRow } from "@/types/database";
import DeleteWorkButton from "@/components/DeleteWorkButton";

export default async function WorksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("works")
    .select("*")
    .order("created_at", { ascending: false });

  // Explicitly cast the returned data to WorkRow[]
  const works = data as WorkRow[] | null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-10 space-y-8 md:space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-stone-900 tracking-tight">
            Our Works
          </h1>
          <p className="text-stone-500 text-sm md:text-base font-medium mt-1">
            Manage portfolio works and upload site media directly.
          </p>
        </div>
      </div>

      {/* Embedded Form Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-black text-stone-800">Add New Work</h2>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">
            Upload images & video walkthroughs
          </p>
        </div>
        <WorkForm />
      </div>

      {/* Existing Works Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-lg font-black text-stone-800">
            Portfolio Gallery
          </h2>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">
            {works?.length || 0} Projects
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {works?.map((work) => (
            <div
              key={work.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              <div className="aspect-video relative bg-stone-100 overflow-hidden shrink-0">
                {work.media?.[0]?.type === "video" ? (
                  <video
                    src={work.media[0].url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <img
                    src={work.media?.[0]?.url}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 mb-3 flex-col">
                    <div className="text-[10px] uppercase font-black tracking-widest bg-stone-100 px-2.5 py-1 rounded-sm text-stone-600">
                      {work.category}
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-widest bg-sky-50 px-2.5 py-1 rounded-sm text-sky-600">
                      {work.status}
                    </div>
                  </div>
                  <DeleteWorkButton id={work.id} title={work.title} />
                </div>
                <h3 className="font-bold text-lg text-stone-800 leading-tight mb-1">
                  {work.title}
                </h3>
                <p className="text-sm text-stone-500 font-medium mt-auto pt-2">
                  {work.location}
                </p>
              </div>
            </div>
          ))}

          {works?.length === 0 && (
            <div className="col-span-full py-20 text-center px-6 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="text-5xl mb-6 opacity-50">🏗️</div>
              <h3 className="text-lg font-bold text-stone-800">
                No Works Added
              </h3>
              <p className="text-stone-500 text-sm mt-1">
                Fill the form above to add your first completed or ongoing
                project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
