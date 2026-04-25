import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Card = ({ title, city, area, address, phone, email }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{city}{area ? ` - ${area}` : ""}</p>
      <p className="text-sm text-gray-600 mt-3">{address || "Address not listed yet"}</p>
      <p className="text-sm text-gray-600 mt-2">{phone || "Phone not listed"}</p>
      <p className="text-sm text-gray-600">{email || "Email not listed"}</p>
    </div>
  );
};

const Collaborations = () => {
  const { backendUrl } = useContext(AppContext);
  const [pharmacies, setPharmacies] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pharmacyRes, labRes] = await Promise.all([
          axios.get(`${backendUrl}/api/pharmacies`),
          axios.get(`${backendUrl}/api/labs`),
        ]);

        // Handle standardized response structure { success: true, data: { pharmacies: [] } }
        const pharmacyData = pharmacyRes.data?.data;
        const labData = labRes.data?.data;

        setPharmacies(pharmacyData?.pharmacies || pharmacyData?.data || []);
        setLabs(labData?.labs || labData?.data || []);
      } catch (error) {
        toast.error("Failed to load collaborations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backendUrl]);

  return (
    <div className="pb-16 animate-fade-in-up">
      <div className="pt-10 pb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Collaborations
        </h1>
        <p className="text-gray-600 mt-2">
          Discover Tabibi partner pharmacies and labs for a connected care journey.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading collaborations...</p>
      ) : (
        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Partner Pharmacies</h2>
              <span className="text-sm text-gray-500">{pharmacies.length} available</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pharmacies.length > 0 ? (
                pharmacies.map((item) => (
                  <Card
                    key={item.id || item._id}
                    title={item.name}
                    city={item.city}
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                  />
                ))
              ) : (
                <p className="text-gray-500">No pharmacies added yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Partner Labs</h2>
              <span className="text-sm text-gray-500">{labs.length} available</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labs.length > 0 ? (
                labs.map((item) => (
                  <Card
                    key={item.id || item._id}
                    title={item.name}
                    city={item.city}
                    address={item.address}
                    phone={item.phone}
                    email={item.email}
                  />
                ))
              ) : (
                <p className="text-gray-500">No labs added yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Collaborations;
