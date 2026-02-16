import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { getCauses, type Cause } from "@/api/causes";
import { getImageUrl, handleImageError } from "@/utils/imageUtils";
import config from "@/config";

const AllCausesPage: React.FC = () => {
  const navigate = useNavigate();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch ALL causes (no filters).
        const data = await getCauses();
        setCauses(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load causes.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filteredCauses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return causes;
    return causes.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [causes, searchTerm]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Causes</h1>
          <p className="text-gray-600 mt-1">
            This page fetches causes via the API: <code>{`GET ${config.apiUrl}/causes`}</code>
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading causes…</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredCauses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No causes found</h3>
            <p className="text-gray-600">Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCauses.map((cause) => (
              <Card
                key={cause._id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/cause/${cause._id}`)}
              >
                <div className="relative">
                  <img
                    src={getImageUrl(cause.imageUrl)}
                    alt={cause.title}
                    className="w-full h-44 object-cover"
                    onError={(e) => handleImageError(e)}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {cause.category ? <Badge variant="secondary">{cause.category}</Badge> : null}
                    {cause.status ? <Badge variant="outline">{cause.status}</Badge> : null}
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{cause.title}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-3">{cause.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllCausesPage;

