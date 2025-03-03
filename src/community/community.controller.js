  // src/controllers/community.controller.js

  import { admin } from "../../configs/firebase.js";
  import { handleErrorResponse } from "../helpers/handleResponse.js";
  import { uploadToCloudinary  } from "../middlewares/multer-uploads.js";

  /**
   * Crea una comunidad nueva. El usuario autenticado es admin.
   * Permite subir una foto a Cloudinary si se recibe un archivo.
   */
  export const createCommunity = async (req, res) => {
    try {
      const { name, description, department } = req.body;
      const adminId = req.usuario.uid; // Usuario autenticado

      // Subir la foto de la comunidad si se envía un archivo
      let communityPicture = "https://placehold.co/80x80?text=Community";
      if (req.file) {
        communityPicture = await uploadToCloudinary(req, "communities");
      }

      const communityData = {
        name,
        description,
        department,
        adminId,
        communityPicture,
        participants: [adminId],
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

  /**
   * Obtiene la lista de todas las comunidades.
   */
  export const getAllCommunities = async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection("communities").get();
      const communities = snapshot.docs.map(doc => ({
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

  /**
   * Obtiene los datos de una comunidad por su ID.
   */
  export const getCommunityById = async (req, res) => {
    const { communityId } = req.params;
    try {
      const db = admin.firestore();
      const docRef = db.collection("communities").doc(communityId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return handleErrorResponse(res, 404, "Comunidad no encontrada");
      }

      return res.status(200).json({
        success: true,
        message: "Comunidad encontrada",
        community: docSnap.data(),
      });
    } catch (error) {
      console.error("Error al obtener la comunidad:", error);
      return handleErrorResponse(res, 500, "Error al obtener la comunidad", error.message);
    }
  };

  /**
   * Unirse a la comunidad (se agrega el usuario autenticado al array "participants").
   */
  export const joinCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.usuario.uid;
    try {
      const db = admin.firestore();
      const communityRef = db.collection("communities").doc(communityId);
      const communityDoc = await communityRef.get();

      if (!communityDoc.exists) {
        return handleErrorResponse(res, 404, "Comunidad no encontrada");
      }

      const communityData = communityDoc.data();
      const { participants } = communityData;

      // Verificar si ya está unido
      if (participants.includes(userId)) {
        return handleErrorResponse(res, 400, "Ya eres participante de esta comunidad");
      }

      const updatedParticipants = [...participants, userId];
      await communityRef.update({
        participants: updatedParticipants,
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: "Te has unido a la comunidad exitosamente",
        participants: updatedParticipants,
      });
    } catch (error) {
      console.error("Error al unirse a la comunidad:", error);
      return handleErrorResponse(res, 500, "Error al unirse a la comunidad", error.message);
    }
  };

  /**
   * Salir de la comunidad (se remueve el usuario autenticado de "participants").
   */
  export const leaveCommunity = async (req, res) => {
    const { communityId } = req.params;
    const userId = req.usuario.uid;
    try {
      const db = admin.firestore();
      const communityRef = db.collection("communities").doc(communityId);
      const communityDoc = await communityRef.get();

      if (!communityDoc.exists) {
        return handleErrorResponse(res, 404, "Comunidad no encontrada");
      }

      const communityData = communityDoc.data();
      const { participants, adminId } = communityData;

      if (!participants.includes(userId)) {
        return handleErrorResponse(res, 400, "No eres participante de esta comunidad");
      }

      // Lógica opcional: si es admin y es el único participante, no permitir o transferir admin
      const updatedParticipants = participants.filter((p) => p !== userId);

      await communityRef.update({
        participants: updatedParticipants,
        updatedAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: "Has salido de la comunidad",
        participants: updatedParticipants,
      });
    } catch (error) {
      console.error("Error al salir de la comunidad:", error);
      return handleErrorResponse(res, 500, "Error al salir de la comunidad", error.message);
    }
  };

  /**
   * Actualiza los campos de la comunidad (nombre, descripción, departamento, foto).
   */
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
        updatedAt: new Date().toISOString(),
      };

      if (name !== undefined) updatedData.name = name;
      if (description !== undefined) updatedData.description = description;
      if (department !== undefined) updatedData.department = department;

      if (req.file) {
        updatedData.communityPicture = await uploadToCloudinary(req, "communities");
      }

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

  /**
   * Elimina la comunidad (borrado físico).
   */
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
