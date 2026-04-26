import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { specialityData } from "../assets/assets";

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, getDoctosData } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [availableOnly, setAvailableOnly] = useState(false);

  const apiFilters = useMemo(
    () => ({
      search: searchTerm.trim(),
      specialization: speciality || "",
      city: city.trim(),
      minRating,
      maxFees,
      isAvailable: availableOnly ? true : undefined,
      sort: sortOption,
    }),
    [searchTerm, speciality, city, minRating, maxFees, availableOnly, sortOption]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      getDoctosData(apiFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [getDoctosData, apiFilters]);

  const getDoctorName = (doc) => {
    if (doc.name) return doc.name
    return `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor'
  }

  const getDoctorId = (doc) => doc.id || doc._id

  return (
    <div className="pb-20 animate-fade-in-up">
      <div className="flex flex-col gap-6 pt-10 pb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Find Your <span className="text-primary">Specialist</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Search doctors by specialty, location, rating, and availability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 bg-white p-4 rounded-2xl shadow-sm">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Doctor name or keyword"
            className="xl:col-span-2 text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <input
            value={maxFees}
            onChange={(e) => setMaxFees(e.target.value)}
            placeholder="Max Fees"
            type="number"
            min="0"
            className="text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Min Rating</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-sm bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="default">Sort by</option>
            <option value="rating_desc">High Rating</option>
            <option value="fees_asc">Lowest Fees</option>
            <option value="experience_desc">Experience</option>
          </select>
          <label className="flex items-center gap-2 px-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Available only
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-8 mt-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-full py-3 px-6 rounded-2xl text-sm font-semibold transition-all sm:hidden flex justify-between items-center ${
            showFilter ? "bg-primary text-white shadow-lg" : "bg-white text-gray-600 shadow-sm border border-gray-100"
          }`}
        >
          Specialty Filters
          <span>{showFilter ? "×" : "☰"}</span>
        </button>

        <div className={`flex-col gap-2 min-w-[220px] transition-all duration-300 ${showFilter ? "flex" : "hidden sm:flex"}`}>
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className={`text-left px-5 py-3 rounded-2xl transition-all duration-300 font-medium text-sm shadow-sm ${
              !speciality
                ? "bg-primary text-white"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            All Specialties
          </button>
          <div className="h-px bg-gray-100 my-2"></div>
          {specialityData.map((item) => (
            <button
              key={item.speciality}
              type="button"
              onClick={() => (speciality === item.speciality ? navigate("/doctors") : navigate(`/doctors/${item.speciality}`))}
              className={`text-left px-5 py-3 rounded-2xl transition-all duration-300 font-medium text-sm shadow-sm whitespace-nowrap ${
                speciality === item.speciality
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {item.speciality}
            </button>
          ))}
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.length > 0 ? (
            doctors.map((item) => {
              const avgRating = item.numRatings > 0 ? item.rating / item.numRatings : 0;
              const docId = getDoctorId(item)
              const docName = getDoctorName(item)
              
              return (
                <div
                  key={docId}
                  onClick={() => {
                    navigate(`/appointment/${docId}`);
                    scrollTo(0, 0);
                  }}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden aspect-square bg-gray-50">
                    <img className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" src={item.image} alt={docName} />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-white/90 backdrop-blur-sm shadow-sm">
                      <span className={`w-2 h-2 rounded-full ${item.available ? "bg-green-500" : "bg-gray-400"}`}></span>
                      <span className={item.available ? "text-green-700" : "text-gray-500"}>
                        {item.available ? "Available" : "Busy"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-400 text-xs mb-1">{item.specialization || item.speciality}</p>
                    <p className="text-gray-800 text-lg font-medium group-hover:text-primary transition-colors">{docName}</p>
                    <p className="text-gray-500 text-sm mt-1">{item.city || item.address?.line1 || item.address || "Location not listed"}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-500 text-sm font-medium">★ {avgRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({item.numRatings || 0})</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        {currencySymbol} {item.fees}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">?</div>
              <p className="text-gray-500 font-medium">No doctors found for the selected filters.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCity("");
                  setMinRating("");
                  setMaxFees("");
                  setAvailableOnly(false);
                  setSortOption("default");
                  navigate("/doctors");
                }}
                className="text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
