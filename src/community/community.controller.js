import { admin } from "../../configs/firebase.js";
import { handleErrorResponse } from "../helpers/handleResponse.js";

// Crear una comunidad
export const createCommunity = async (req, res) => {
    try {
      const { name, description, department } = req.body;
      
      const adminId = req.usuario.uid;
  
      const communityData = {
        name,
        description,
        department,
        adminId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      const db = admin.firestore();
      const communityRef = await db.collection("communities").add(communityData);
  
      return res.status(201).json({
        success: true,
        message: "Comunidad creada exitosamente",
        community: { id: communityRef.id, ...communityData },
      });
    } catch (error) {
      console.error("Error al crear la comunidad:", error);
      return handleErrorResponse(res, 500, "Error al crear la comunidad", error.message);
    }
  };
  

// Listar todas las comunidades
export const getAllCommunities = async (req, res) => {
  try {
    const db = admin.firestore();
    const communitiesSnapshot = await db.collection("communities").get();
    const communities = communitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json({
      success: true,
      message: "Comunidades obtenidas exitosamente",
      communities,
    });
  } catch (error) {
    console.error("Error al obtener comunidades:", error);
    return handleErrorResponse(res, 500, "Error al obtener comunidades", error.message);
  }
};

// Obtener comunidad por ID
export const getCommunityById = async (req, res) => {
  const { communityId } = req.params;
  try {
    const db = admin.firestore();
    const communityDoc = await db.collection("communities").doc(communityId).get();
    if (!communityDoc.exists) {
      return handleErrorResponse(res, 404, "Comunidad no encontrada");
    }
    return res.status(200).json({
      success: true,
      message: "Comunidad encontrada",
      community: communityDoc.data(),
    });
  } catch (error) {
    console.error("Error al obtener comunidad:", error);
    return handleErrorResponse(res, 500, "Error al obtener comunidad", error.message);
  }
};

// Actualizar comunidad
export const updateCommunity = async (req, res) => {
  const { communityId } = req.params;
  const { name, description, department } = req.body;
  try {
    const db = admin.firestore();
    const communityRef = db.collection("communities").doc(communityId);
    const communityDoc = await communityRef.get();
    if (!communityDoc.exists) {
      return handleErrorResponse(res, 404, "Comunidad no encontrada");
    }
    const updatedData = {
      name,
      description,
      department,
      updatedAt: new Date().toISOString(),
    };
    await communityRef.update(updatedData);
    return res.status(200).json({
      success: true,
      message: "Comunidad actualizada exitosamente",
      community: updatedData,
    });
  } catch (error) {
    console.error("Error al actualizar la comunidad:", error);
    return handleErrorResponse(res, 500, "Error al actualizar la comunidad", error.message);
  }
};

// Eliminar comunidad (borrado físico)
export const deleteCommunity = async (req, res) => {
  const { communityId } = req.params;
  try {
    const db = admin.firestore();
    const communityRef = db.collection("communities").doc(communityId);
    const communityDoc = await communityRef.get();
    if (!communityDoc.exists) {
      return handleErrorResponse(res, 404, "Comunidad no encontrada");
    }
    await communityRef.delete();
    return res.status(200).json({
      success: true,
      message: "Comunidad eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar la comunidad:", error);
    return handleErrorResponse(res, 500, "Error al eliminar la comunidad", error.message);
  }
};
