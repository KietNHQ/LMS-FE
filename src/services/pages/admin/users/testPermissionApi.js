import { permissionService } from "./permissionService";

/**
 * TEST SCRIPT FOR PERMISSION API
 * 
 * You can import and run this function in a component or console to test the API.
 */
export const testPermissionFlow = async (userId = 1) => {
  console.log("🚀 Starting Permission API Test...");

  try {
    // 1. Test Get All Permissions
    console.log("1. Fetching all system permissions...");
    const allPerms = await permissionService.getAllPermissions();
    console.log("✅ Success! Found permissions:", allPerms.length);

    // 2. Test Get User Permissions
    console.log(`2. Fetching permissions for user ID: ${userId}...`);
    const userPerms = await permissionService.getUserPermissions(userId);
    console.log("✅ Success! User has permissions:", userPerms);

    // 3. Test Update Permissions (Append mode)
    console.log(`3. Testing permission update (append 'grades:read')...`);
    // Note: permissionId usually needs to be an integer if the backend follows the guide
    // If 'grades:read' has an ID (e.g., 5), we use that. 
    // Here we use a dummy ID for demonstration.
    const updateResult = await permissionService.updateUserPermissions(userId, {
      mode: "append",
      permissions: [
        { permissionId: 1, granted: true } // Assuming 1 is some valid ID
      ]
    });
    console.log("✅ Success! Update response:", updateResult);

    console.log("🎉 Permission API Test Completed Successfully!");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
    }
    return false;
  }
};

