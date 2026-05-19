import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/client";
import { toast } from "react-toastify";

const Card = ({ title, city, area, address, phone, email }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl border border-border-light p-5 shadow-sm hover:shadow-md transition-all">
      <h3 className="text-base font-bold text-text">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{city}{area ? ` - ${area}` : ""}</p>
      <p className="text-sm text-text-secondary mt-3">{address || t('collaborations.addressNotListed')}</p>
      <p className="text-sm text-text-secondary mt-2">{phone || t('collaborations.phoneNotListed')}</p>
      <p className="text-sm text-text-secondary">{email || t('collaborations.emailNotListed')}</p>
    </div>
  );
};

const Collaborations = () => {
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pharmacyRes, labRes] = await Promise.all([
          api.get("/api/pharmacies"),
          api.get("/api/labs"),
        ]);

        const pharmacyData = pharmacyRes.data?.data;
        const labData = labRes.data?.data;

        setPharmacies(Array.isArray(pharmacyData) ? pharmacyData : []);
        setLabs(Array.isArray(labData) ? labData : []);
      } catch (error) {
        toast.error(t('collaborations.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="pb-16 animate-fade-in-up">
      <div className="pt-10 pb-8">
        <h1 className="text-3xl font-display font-bold text-text">
          {t('collaborations.collaborations')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('collaborations.discoverPartners')}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">{t('collaborations.loading')}</p>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('collaborations.partnerPharmacies')}</h2>
              <span className="text-sm text-gray-500">{pharmacies.length} {t('collaborations.available')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pharmacies.length > 0 ? (
                pharmacies.map((item) => (
                  <Card
                    key={item.id || item._id}
                    title={item.name}
                    city={item.city}
                    area={item.area}
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                  />
                ))
              ) : (
                <p className="text-gray-500">{t('collaborations.noPharmacies')}</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('collaborations.partnerLabs')}</h2>
              <span className="text-sm text-gray-500">{labs.length} {t('collaborations.available')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labs.length > 0 ? (
                labs.map((item) => (
                  <Card
                    key={item.id || item._id}
                    title={item.name}
                    city={item.city}
                    area={item.area}
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                  />
                ))
              ) : (
                <p className="text-gray-500">{t('collaborations.noLabs')}</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Collaborations;
