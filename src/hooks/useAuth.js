import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from "../services/shared/auth/authService";
import { toast } from 'react-toastify';
import { PERMISSIONS } from '../config/permissions';

// Helper: Chuyển đổi danh sách quyền từ BE (object) sang FE (string key)
const normalizePermissions = (permissionsInput) => {
    // Nếu BE bọc quyền trong 1 object { permissions: [...] }
    const permissions = Array.isArray(permissionsInput) 
        ? permissionsInput 
        : (permissionsInput?.permissions || permissionsInput?.items || []);

    if (!Array.isArray(permissions)) return [];
    
    return permissions.map(p => {
        if (typeof p === 'string') return p;
        if (typeof p === 'object' && p.resource && p.action) {
            return `${p.resource}:${p.action}`;
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

            // KIỂM TRA TRẠNG THÁI TÀI KHOẢN
            if (user.status === "Vô hiệu hóa") {
                localStorage.clear();
                sessionStorage.clear();
                toast.error("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Quản trị viên!");
                return;
            }

            // LƯU ĐẦY ĐỦ CẢ ACCESS VÀ REFRESH TOKEN
            storage.setItem('accessToken', session.accessToken);
            storage.setItem('refreshToken', session.refreshToken);
            storage.setItem('userRole', user.role);
            
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
            // 1. Quét sạch Local/Session Storage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Xóa bộ nhớ đệm của React Query để tránh rò rỉ dữ liệu cũ
            queryClient.clear();

            toast.success('Đã đăng xuất!');
            navigate('/login');
        },
        onError: () => {
            // Kể cả khi Backend báo lỗi (do token đã hết hạn sẵn),
            // ở Frontend vẫn phải clear storage và đá văng ra ngoài
            localStorage.clear();
            sessionStorage.clear();
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
            
            const isLocal = !!localStorage.getItem('user');
            const storage = isLocal ? localStorage : sessionStorage;
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
    const userString = localStorage.getItem('user');
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
