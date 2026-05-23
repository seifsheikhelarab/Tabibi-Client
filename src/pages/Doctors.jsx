import React, { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import { specialityData } from "../assets/assets";
import { authClient } from "../api/auth";

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Doctors = () => {
  const { t } = useTranslation();
  const { speciality } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, getDoctosData } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [availableOnly, setAvailableOnly] = useState(false);

  // Get auth session for chat
  const { data: session } = authClient.useSession();
  const token = session?.session?.token;

  const apiFilters = useMemo(
    () => {
      const filters = {
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(speciality && { specialization: speciality }),
        ...(minRating && { minRating }),
        ...(maxFees && { maxFees }),
        ...(availableOnly && { isAvailable: true }),
        ...(sortOption !== 'default' && { sort: sortOption }),
      };
      return filters;
    },
    [searchTerm, speciality, minRating, maxFees, availableOnly, sortOption]
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

  const startChat = async (doctorId, e) => {
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${SOCKET_URL}/api/chat/get-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ doctorId })
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/chat/${doctorId}`);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-border-light">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('doctors.doctorNamePlaceholder')}
            className="text-sm bg-surface-raised rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium border border-border-light hover:border-primary/30"
          />
          <input
            value={maxFees}
            onChange={(e) => setMaxFees(e.target.value)}
            placeholder={t('doctors.maxFees')}
            type="number"
            min="0"
            className="text-sm bg-surface-raised rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium border border-border-light hover:border-primary/30"
          />
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="text-sm bg-surface-raised text-text-secondary rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium border border-border-light cursor-pointer appearance-none hover:border-primary/30"
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
            className="text-sm bg-surface-raised text-text-secondary rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 font-medium border border-border-light cursor-pointer appearance-none hover:border-primary/30"
          >
            <option value="default">{t('doctors.sortBy')}</option>
            <option value="rating_desc">{t('doctors.highRating')}</option>
            <option value="fees_asc">{t('doctors.lowestFees')}</option>
            <option value="experience_desc">{t('doctors.experience')}</option>
          </select>
          <button
            onClick={() => navigate("/doctors")}
            className="text-sm bg-surface-raised text-text-muted rounded-xl px-4 py-2.5 font-medium border border-border-light hover:border-primary/30 hover:text-text-secondary transition-all duration-200 lg:col-span-1"
          >
            {t('doctors.clearFilters')}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <label className="flex items-center gap-2.5 text-sm text-text-secondary font-medium cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer transition-all duration-200"
            />
            <span className="group-hover:text-primary transition-colors duration-200">{t('doctors.showAvailableOnly')}</span>
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
                    
                    <button
                      onClick={(e) => startChat(docId, e)}
                      className="mt-3 w-full py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t('doctors.message')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-5 bg-surface-raised rounded-2xl border-2 border-dashed border-border">
              <div className="w-16 h-16 bg-border-light rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <p className="text-text-secondary font-semibold">{t('doctors.noDoctorsMatch')}</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setMinRating("");
                  setMaxFees("");
                  setAvailableOnly(false);
                  setSortOption("default");
                  navigate("/doctors");
                }}
                className="text-primary font-semibold text-sm px-5 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all duration-200"
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