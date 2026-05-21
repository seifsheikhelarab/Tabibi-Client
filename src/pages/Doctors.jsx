import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { specialityData } from "../assets/assets";

const Doctors = () => {
  const { t } = useTranslation();
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
    if (doc.name) return doc.name;
    return `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor';
  };

  const getDoctorId = (doc) => doc.id || doc._id;

  return (
    <div className="pb-20 animate-fade-in-up">
      <div className="flex flex-col gap-5 pt-10 pb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-text tracking-tight">
            {t('doctors.findYourSpecialist')} <span className="text-primary">{t('doctors.specialist')}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1.5 font-medium">
            {t('doctors.searchDirectory')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 bg-white p-4 rounded-2xl border border-border-light">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('doctors.doctorNamePlaceholder')}
            className="xl:col-span-2 text-sm bg-surface-raised rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium border border-border-light"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('doctors.locationPlaceholder')}
            className="text-sm bg-surface-raised rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium border border-border-light"
          />
          <input
            value={maxFees}
            onChange={(e) => setMaxFees(e.target.value)}
            placeholder={t('doctors.maxFees')}
            type="number"
            min="0"
            className="text-sm bg-surface-raised rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium border border-border-light"
          />
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="text-sm bg-surface-raised text-text-secondary rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium border border-border-light cursor-pointer"
          >
            <option value="">{t('doctors.minRating')}</option>
            <option value="1">{t('doctors.rating1Plus')}</option>
            <option value="2">{t('doctors.rating2Plus')}</option>
            <option value="3">{t('doctors.rating3Plus')}</option>
            <option value="4">{t('doctors.rating4Plus')}</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-sm bg-surface-raised text-text-secondary rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium border border-border-light cursor-pointer"
          >
            <option value="default">{t('doctors.sortBy')}</option>
            <option value="rating_desc">{t('doctors.highRating')}</option>
            <option value="fees_asc">{t('doctors.lowestFees')}</option>
            <option value="experience_desc">{t('doctors.experience')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 text-sm text-text-secondary font-medium cursor-pointer group">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <span className="group-hover:text-primary transition-colors">{t('doctors.showAvailableOnly')}</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-8 mt-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all sm:hidden flex justify-between items-center ${
            showFilter ? "bg-primary text-white shadow-md" : "bg-white text-text-secondary shadow-sm border border-border-light"
          }`}
        >
          {t('doctors.specialtyFilters')}
          <span>{showFilter ? "\u2715" : "\u2630"}</span>
        </button>

        <div className={`flex-col gap-1.5 min-w-[200px] transition-all duration-300 ${showFilter ? "flex" : "hidden sm:flex"}`}>
          <button
            type="button"
            onClick={() => navigate("/doctors")}
            className={`text-left px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
              !speciality
                ? "bg-primary text-white"
                : "bg-surface-raised text-text-secondary hover:bg-border-light hover:text-text"
            }`}
          >
            {t('doctors.allSpecialties')}
          </button>
          <div className="h-px bg-border-light my-1.5"></div>
          {specialityData.map((item) => (
            <button
              key={item.speciality}
              type="button"
              onClick={() => (speciality === item.speciality ? navigate("/doctors") : navigate(`/doctors/${item.speciality}`))}
              className={`text-left px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                speciality === item.speciality
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-raised text-text-secondary hover:bg-border-light hover:text-text"
              }`}
            >
              {item.speciality}
            </button>
          ))}
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {doctors.length > 0 ? (
            doctors.map((item, index) => {
              const avgRating = item.numRatings > 0 ? item.rating / item.numRatings : 0;
              const docId = getDoctorId(item);
              const docName = getDoctorName(item);
              
              return (
                <div
                  key={docId}
                  onClick={() => {
                    navigate(`/appointment/${docId}`);
                    scrollTo(0, 0);
                  }}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-border-light hover:shadow-md transition-all duration-300 animate-fade-in-up"
                >
                  <div className="relative overflow-hidden aspect-square bg-surface-raised">
                    <img className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105" src={item.image} alt={docName} />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white shadow-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-green-500" : "bg-gray-400"}`}></span>
                      <span className={item.available ? "text-green-700" : "text-text-muted"}>
                        {item.available ? t('doctors.available') : t('doctors.busy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-0.5">{item.specialization || item.speciality}</p>
                    <p className="text-text text-base font-bold line-clamp-1">{docName}</p>
                    <p className="text-text-secondary text-sm mt-0.5 font-medium">{item.city || item.address?.line1 || item.address || t('doctors.locationNotListed')}</p>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                      <div className="flex items-center gap-1">
                        <span className="text-amber text-sm font-bold">&#9733; {avgRating.toFixed(1)}</span>
                        <span className="text-xs text-text-muted font-medium">({item.numRatings || 0})</span>
                      </div>
                      <p className="text-sm font-bold text-text">
                        {currencySymbol} {item.fees}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 bg-surface-raised rounded-2xl border-2 border-dashed border-border">
              <div className="w-14 h-14 bg-border-light rounded-full flex items-center justify-center text-2xl">?</div>
              <p className="text-text-secondary font-semibold">{t('doctors.noDoctorsMatch')}</p>
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
                className="text-primary font-semibold hover:underline text-sm"
              >
                {t('doctors.resetFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;