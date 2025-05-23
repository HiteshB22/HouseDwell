import { useState, useEffect } from "react";
import { FiList, FiGrid } from "react-icons/fi";
import axios from "axios";
import PropertyCard from "../components/PropertyCard";

const ListingsPage = () => {
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("none");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    amenities: [],
    bhk: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/v1/property", {
          withCredentials: true,
        });
        if (response.data.success) {
          setProperties(response.data.properties);
        } else {
          setError("Failed to load properties");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching properties");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const itemsPerPage = 9;

  const handleSort = (option) => {
    setSortOption(option);
  };

  const handleFilterChange = (type, value) => {
    if (type === "amenity") {
      setFilters((prev) => {
        const newAmenities = prev.amenities.includes(value)
          ? prev.amenities.filter((f) => f !== value)
          : [...prev.amenities, value];
        return { ...prev, amenities: newAmenities };
      });
    } else if (type === "bhk") {
      setFilters((prev) => ({ ...prev, bhk: value }));
    } else {
      setFilters((prev) => ({ ...prev, [type]: value }));
    }
  };

  const filteredProperties = properties
    .filter((prop) => {
      const { minPrice, maxPrice, amenities, bhk } = filters;
      const meetsPrice =
        (!minPrice || prop.price >= parseInt(minPrice)) &&
        (!maxPrice || prop.price <= parseInt(maxPrice));

      const meetsFacilities =
        amenities.length === 0 ||
        amenities.every((f) => (f === "Gym" ? prop.gym : prop.parking));

      const meetsBHK = !bhk || `${prop.BHK} BHK` === bhk;
      return meetsPrice && meetsFacilities && meetsBHK;
    })
    .sort((a, b) => {
      if (sortOption === "asc") return a.price - b.price;
      if (sortOption === "desc") return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirst, indexOfLast);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Property Listings</h1>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 border rounded-md p-2">
        <select className="border p-2 rounded-md" onChange={(e) => handleSort(e.target.value)}>
          <option value="none">Sort by Price</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
        <button className="border p-2 rounded-md">Filters</button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 p-4 border rounded-lg mb-6 md:mb-0">
          <h2 className="font-semibold mb-2">Filters</h2>

          <div className="mb-4">
            <label className="block font-medium">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="border p-2 rounded-md w-1/2"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="border p-2 rounded-md w-1/2"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium">Required amenities</label>
            {[
              { label: "Gym", key: "gym" },
              { label: "Parking", key: "parking" },
            ].map((a) => (
              <div key={a.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(a.label)}
                  onChange={() => handleFilterChange("amenity", a.label)}
                />
                <span>{a.label}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block font-medium">Bedrooms</label>
            <div className="flex flex-wrap gap-2">
              {["1 BHK", "2 BHK", "3 BHK", "4 BHK"].map((bhk) => (
                <button
                  key={bhk}
                  onClick={() => handleFilterChange("bhk", bhk)}
                  className={`border p-2 rounded-md ${filters.bhk === bhk ? "bg-black text-white" : ""}`}
                >
                  {bhk}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4 px-0 md:px-6">
          <div className="flex justify-between items-center mb-4">
            <p>Showing {currentProperties.length} properties</p>
            <div className="flex gap-2">
              <FiList
                className={`cursor-pointer ${view === "list" ? "text-gray-400" : ""}`}
                size={20}
                onClick={() => setView("list")}
              />
              <FiGrid
                className={`cursor-pointer ${view === "grid" ? "text-gray-400" : ""}`}
                size={20}
                onClick={() => setView("grid")}
              />
            </div>
          </div>

          <div
            className={`${
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }`}
          >
            {currentProperties.map((property) => (
              <PropertyCard key={property._id} property={property} view={view} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === i + 1 ? "bg-gray-500 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;
