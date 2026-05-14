import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from "../services/shared/auth/authService";
import { toast } from 'react-toastify';
import { PERMISSIONS } from '../config/permissions';

// Mapping từ Backend ID sang Frontend Key (Dựa trên dữ liệu người dùng cung cấp)
const PERMISSION_ID_MAP = {
    "1": "users:read", "2": "users:create", "3": "users:update", "4": "users:delete",
    "5": "grades:read", "6": "grades:create", "7": "grades:finalize", "8": "grades:unlock",
    "9": "audit_logs:read", "10": "permissions:manage", "11": "classes:read", "12": "classes:manage",
    "13": "students:read", "14": "departments:manage", "15": "class_allocation:read", "16": "class_allocation:manage",
    "17": "exam:read", "18": "exam:manage", "19": "reward_types:read", "20": "reward_types:manage",
    "21": "discipline:read", "22": "discipline:manage", "23": "attendance:read", "24": "attendance:manage",
    "25": "fees:read", "26": "fees:manage", "27": "teachers:read", "28": "teachers:manage",
    "29": "notifications:read", "30": "notifications:manage", "31": "guardians:read", "32": "guardians:create",
    "33": "guardians:update", "34": "guardians:delete", "35": "students:create", "36": "students:update",
    "37": "students:delete", "38": "teachers:create", "39": "teachers:update", "40": "teachers:delete",
    "41": "dashboard:read", "42": "reports:read", "43": "lessons:read", "44": "lessons:create",
    "45": "lessons:update", "46": "lessons:delete", "47": "classes:assign_officers", "48": "classes:read_summary",
    "49": "notifications:broadcast"
};

// Helper: Chuyển đổi danh sách quyền từ BE (object/id) sang FE (string key)
const normalizePermissions = (permissionsInput) => {
    // Nếu BE bọc quyền trong 1 object { permissions: [...] }
    const permissions = Array.isArray(permissionsInput) 
        ? permissionsInput 
        : (permissionsInput?.permissions || permissionsInput?.items || []);

    if (!Array.isArray(permissions)) return [];
    
    return permissions.map(p => {
        // Nếu là string key (đúng chuẩn FE)
        if (typeof p === 'string') return p;
        
        // Nếu là ID (số hoặc chuỗi số) -> Map sang string key
        if (typeof p === 'number' || (!isNaN(p) && !isNaN(parseFloat(p)))) {
            return PERMISSION_ID_MAP[String(p)] || p;
        }

        // Nếu là object chi tiết { id, resource, action }
        if (typeof p === 'object' && p.resource && p.action) {
            return `${p.resource}:${p.action}`;
        }
        
        // Nếu là object có ID
        if (typeof p === 'object' && p.id) {
            return PERMISSION_ID_MAP[String(p.id)] || p;
        }

        return p;
    });
};

export const useLogin = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (credentials) => authService.login(credentials),
        onSuccess: (response, variables) => {
            const { user, session } = response.data;
            const { rememberMe } = variables;

            const storage = rememberMe ? localStorage : sessionStorage;
            const otherStorage = rememberMe ? sessionStorage : localStorage;

            // KIỂM TRA TRẠNG THÁI TÀI KHOẢN
            if (user.status === "Vô hiệu hóa") {
                const authItems = ["accessToken", "refreshToken", "user", "userRole", "teacher_unread_notifications_count", "student_unread_notifications_count", "parent_unread_notifications_count"];
                authItems.forEach(item => {
                    localStorage.removeItem(item);
                    sessionStorage.removeItem(item);
                });
                toast.error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên!");
                return;
            }

            // Dọn dẹp storage đối diện để tránh xung đột dữ liệu cũ
            otherStorage.removeItem('accessToken');
            otherStorage.removeItem('refreshToken');
            otherStorage.removeItem('user');
            otherStorage.removeItem('userRole');

            // LƯU ĐẦY ĐỦ CẢ ACCESS VÀ REFRESH TOKEN
            storage.setItem('accessToken', session.accessToken);
            storage.setItem('refreshToken', session.refreshToken);
            storage.setItem('userRole', user.role);
            storage.setItem('isPersistent', rememberMe ? 'true' : 'false');
            
            // Cấp "giấy thông hành" cho tab hiện tại để vượt qua chốt chặn
            sessionStorage.setItem('tab_session_id', Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9));
            
            // Chuẩn hóa permissions trước khi lưu
            const normalizedUser = {
                ...user,
                permissions: normalizePermissions(user.permissions)
            };
            storage.setItem('user', JSON.stringify(normalizedUser));

            toast.success('Đăng nhập thành công!');

            const role = user.role?.toLowerCase();
            if (role === 'admin' || role === 'quản trị viên' || role === 'administrator') {
                navigate('/admin/dashboard');
            } else if (role === 'manager' || role === 'management' || ['quản lý', 'hiệu trưởng', 'phó ht học vụ', 'phó ht nề nếp', 'giáo vụ', 'tài chính', 'tổ trưởng bộ môn'].includes(role)) {
                navigate('/management/dashboard');
            } else if (role === 'teacher' || role === 'giáo viên') {
                navigate('/teacher/dashboard');
            } else if (role === 'student' || role === 'học sinh') {
                navigate('/student/dashboard');
            } else if (role === 'guardian' || role === 'parent' || role === 'phụ huynh') {
                navigate('/parent/dashboard');
            } else {
                navigate('/');
            }
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại!';
            toast.error(errorMsg);
        }
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email) => authService.forgotPassword(email)
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data) => authService.resetPassword(data)
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            // 1. targeted cleanup instead of clear()
            const authItems = ["accessToken", "refreshToken", "user", "userRole", "teacher_unread_notifications_count", "student_unread_notifications_count", "parent_unread_notifications_count"];
            authItems.forEach(item => {
                localStorage.removeItem(item);
                sessionStorage.removeItem(item);
            });

            // 2. Xóa bộ nhớ đệm của React Query để tránh rò rỉ dữ liệu cũ
            queryClient.clear();

            toast.success('Đã đăng xuất!');
            navigate('/login');
        },
        onError: () => {
            // Kể cả khi Backend báo lỗi (do token đã hết hạn sẵn),
            // ở Frontend vẫn phải clear storage và đá văng ra ngoài
            const authItems = ["accessToken", "refreshToken", "user", "userRole", "teacher_unread_notifications_count", "student_unread_notifications_count", "parent_unread_notifications_count"];
            authItems.forEach(item => {
                localStorage.removeItem(item);
                sessionStorage.removeItem(item);
            });
            queryClient.clear();
            navigate('/login');
        }
    });
};

export const useGetMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const response = await authService.getMe();
            // Backend trả về { success: true, data: { user: {...}, profile: {...} } }
            // Hoặc đôi khi chỉ trả về object data trực tiếp tùy vào cấu hình axiosClient
            const data = response?.data ?? response;
            
            // Tách user và profile
            const user = data?.user ?? data;
            const profile = data?.profile ?? null;
            
            if (!user || !user.id) {
                console.warn("useGetMe: User data is incomplete", data);
                return null;
            }

            // [WORKAROUND] Luôn fetch permissions tươi từ DB cho các role quản lý/nhân viên
            const staffRoles = ['admin', 'quản trị viên', 'management', 'quản lý', 'principal', 'vp_academic', 'vp_discipline', 'academic_staff', 'finance_staff', 'teacher', 'giáo viên', 'manager'];
            const userRole = user.role?.toLowerCase();
            
            if (staffRoles.includes(userRole) || !user.permissions || user.permissions.length === 0) {
                try {
                    const { permissionService } = await import('../services/pages/admin/users/permissionService');
                    const perms = await permissionService.getUserPermissions(user.id);
                    user.permissions = Array.isArray(perms) ? perms : [];
                } catch (err) {
                    console.error("Failed to fetch fresh permissions for user:", user.id, err);
                }
            }
            
            // Sync to storage
            const normalizedUser = {
                ...user,
                profile, // Đính kèm profile vào object user để dùng ở FE
                permissions: normalizePermissions(user.permissions)
            };
            
            // [STRICT] Chỉ lưu vào localStorage nếu refreshToken cũng đang nằm ở đó
            const isPersistent = !!localStorage.getItem('refreshToken');
            const storage = isPersistent ? localStorage : sessionStorage;
            
            storage.setItem('user', JSON.stringify(normalizedUser));
            if (user.role) storage.setItem('userRole', user.role);
            
            return normalizedUser;
        },
        retry: false,
        staleTime: 30 * 1000, // Fetch every 30s to keep permissions fresh
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data) => authService.changePassword(data),
        onSuccess: (response) => {
            const { session } = response.data || {};
            if (session?.accessToken) {
                // Xác định storage đang dùng (ưu tiên localStorage nếu có accessToken ở đó)
                const isLocal = !!localStorage.getItem('accessToken');
                const storage = isLocal ? localStorage : sessionStorage;
                
                storage.setItem('accessToken', session.accessToken);
                if (session.refreshToken) {
                    storage.setItem('refreshToken', session.refreshToken);
                }
                
                // Cập nhật lại trạng thái requirePasswordChange trong object user ở storage
                const userStr = storage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        // Cập nhật cả 2 định dạng để đảm bảo tương thích
                        user.requirePasswordChange = false;
                        user.require_password_change = false;
                        storage.setItem('user', JSON.stringify(user));
                    } catch (err) {
                        console.error("Failed to update user in storage:", err);
                    }
                }
            }
        }
    });
};
export const useListUsers = (params) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => authService.listUsers(params),
        keepPreviousData: true, // Giúp UX mượt hơn khi chuyển trang/lọc
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userData) => authService.createUser(userData),
        onSuccess: () => {
            // Tạo thành công thì tự động load lại danh sách user
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success("Tạo người dùng thành công!");
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.error || "Có lỗi xảy ra khi tạo người dùng.";
            toast.error(errorMsg);
        }
    });
};

export const useImportUsers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) => authService.importUsers(formData),
        onSuccess: () => {
            // Import xong tự động giật load lại bảng danh sách User
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => authService.updateUser(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};

export const useCheckPermission = () => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    
    const hasPermission = (requiredPermission) => {
        // Admin bypass - only for the technical 'admin' role
        const role = user.role?.toLowerCase() || '';
        if (role === 'admin' || role === 'quản trị viên') return true;
        
        // Check if user has the specific permission
        if (Array.isArray(user.permissions)) {
            return user.permissions.includes(requiredPermission);
        }
        
        return false;
    };

    return { hasPermission, user };
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => authService.deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};
