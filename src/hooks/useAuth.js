import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from "../services/shared/auth/authService";
import { toast } from 'react-toastify';

export const useLogin = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (credentials) => authService.login(credentials),
        onSuccess: (response, variables) => {
            const { user, session } = response.data;
            const { rememberMe } = variables;

            const storage = rememberMe ? localStorage : sessionStorage;

            // Xóa sạch rác ở cả 2 nơi trước khi lưu mới
            localStorage.clear();
            sessionStorage.clear();

            // LƯU ĐẦY ĐỦ CẢ ACCESS VÀ REFRESH TOKEN
            storage.setItem('accessToken', session.accessToken);
            storage.setItem('refreshToken', session.refreshToken);
            storage.setItem('userRole', user.role);

            toast.success('Đăng nhập thành công!');

            switch (user.role) {
                case 'student': navigate('/student/dashboard'); break;
                case 'teacher': navigate('/teacher/dashboard'); break;
                case 'guardian': navigate('/parent/dashboard'); break;
                case 'admin': navigate('/admin/dashboard'); break;
                default: navigate('/');
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
        queryKey: ['me'], // Tên cache trong React Query
        queryFn: () => authService.getMe(),
        retry: false, // Nếu lỗi 401 thì không cố gọi lại liên tục
        staleTime: 5 * 60 * 1000, // 5 phút mới cần fetch lại (đỡ tốn tài nguyên)
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data) => authService.changePassword(data)
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

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => authService.deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    });
};