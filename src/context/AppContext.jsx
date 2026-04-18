import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { doctorsApi, patientsApi, appointmentsApi } from "../api/client";
import { authClient } from "../api/auth";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'EGP'

    const [doctors, setDoctors] = useState([])
    const [userData, setUserData] = useState(false)
    const [patientData, setPatientData] = useState(null)
    const [patientAppointments, setPatientAppointments] = useState([])
    const { data: session, isPending } = authClient.useSession()

    const getDoctosData = useCallback(async (filters = {}) => {
        try {
            const result = await doctorsApi.list(filters)
            if (result?.data && Array.isArray(result.data)) {
                setDoctors(result.data)
            } else if (Array.isArray(result)) {
                setDoctors(result)
            } else {
                setDoctors([])
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [])

    const loadPatientData = useCallback(async () => {
        if (!session?.user?.id) return

        try {
            const organizationId = session?.activeOrganizationId || session?.user?.organizationId
            const result = await patientsApi.getByUserId(session.user.id, organizationId)
            if (result?.data && Array.isArray(result.data) && result.data[0]) {
                setPatientData(result.data[0])
            } else if (result?.data?.id) {
                setPatientData(result.data)
            } else if (result?.id) {
                setPatientData(result)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [session?.user?.id, session?.activeOrganizationId, session?.user?.organizationId])

    const loadUserProfileData = useCallback(async () => {
        if (!session?.user) return

        setUserData({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            phone: session.user.phone,
        })
        if (patientData?.id) {
            setUserData(prev => ({
                ...prev,
                address: patientData.address,
                dob: patientData.dateOfBirth,
                gender: patientData.gender
            }))
        }
    }, [session?.user, patientData?.id])

    const loadPatientAppointments = useCallback(async () => {
        if (!patientData?.id) return

        try {
            const result = await appointmentsApi.list({ patientId: patientData.id })
            if (result?.data && Array.isArray(result.data)) {
                setPatientAppointments(result.data)
            } else if (Array.isArray(result)) {
                setPatientAppointments(result)
            } else {
                setPatientAppointments([])
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [patientData?.id])

    const createPatientProfile = useCallback(async (data) => {
        try {
            const organizationId = session?.activeOrganizationId || session?.user?.organizationId
            if (!organizationId) {
                toast.error('No organization found. Please select or create one.')
                return null
            }

            const result = await patientsApi.create({
                ...data,
                userId: session.user.id,
                organizationId
            })
            const patient = result?.data ?? result
            setPatientData(patient)
            return patient
        } catch (error) {
            console.error(error)
            toast.error(error.message)
            return null
        }
    }, [session?.user?.id, session?.activeOrganizationId, session?.user?.organizationId])

    const updateUserProfileData = useCallback(async (data) => {
        if (!patientData?.id) return false

        try {
            const result = await patientsApi.update(patientData.id, data)
            const patient = result?.data ?? result
            setPatientData(patient)
            toast.success('Profile updated successfully')
            return true
        } catch (error) {
            console.error(error)
            toast.error(error.message)
            return false
        }
    }, [patientData?.id])

    useEffect(() => {
        getDoctosData()
    }, [getDoctosData])

    useEffect(() => {
        if (!isPending) {
            loadPatientData().then(() => {
                loadUserProfileData()
            })
        }
    }, [isPending])

    useEffect(() => {
        if (patientData?.id) {
            loadPatientAppointments()
        }
    }, [patientData?.id, loadPatientAppointments])

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        userData, setUserData, loadUserProfileData,
        patientData, setPatientData, loadPatientData,
        patientAppointments, setPatientAppointments, loadPatientAppointments,
        createPatientProfile,
        updateUserProfileData,
        session
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
