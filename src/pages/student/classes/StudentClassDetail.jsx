import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import { classList } from "./classesData";

const ui = {
  heading: "#22324a",
  text: "#5f6f89",
  muted: "#7a879d",
  border: "#e6ecf7",
  softBorder: "#edf2fb",
  softBg: "#fafcff",
  primaryBg: "#f1f5ff",
  primaryText: "#5877c8",
  primary: "#8aa7f2",
};

function getAssignmentChipSx(status) {
  if (status === "In Progress" || status === "Đang làm") {
    return { bgcolor: "#fff8ee", color: "#b98432", border: "1px solid #f7e7ca" };
  }

  if (status === "Not Started" || status === "Chưa bắt đầu") {
    return { bgcolor: ui.primaryBg, color: ui.primaryText, border: `1px solid ${ui.border}` };
  }

  return { bgcolor: "#eef8f2", color: "#3d8a62", border: "1px solid #d5eddc" };
}

export default function StudentClassDetail() {
  const { classId } = useParams();
  const classInfo = classList.find((item) => item.id === classId);

  if (!classInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5eaf3" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: ui.heading }}>
              Không tìm thấy lớp học
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Lớp học này có thể đã được cập nhật hoặc không còn khả dụng.
            </Typography>
            <Button
              component={Link}
              to="/student/classes"
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: ui.border,
                color: ui.primaryText,
                borderRadius: 2,
                bgcolor: ui.softBg,
                px: 1.5,
                py: 0.65,
                minHeight: 34,
                "&:hover": {
                  borderColor: "#c8d6f0",
                  bgcolor: ui.primaryBg,
                },
              }}
            >
              Quay lại danh sách lớp
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3.5 }}>
      <Button
        component={Link}
        to="/student/classes"
        variant="outlined"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 500,
          fontSize: 14,
          borderColor: ui.border,
          color: ui.primaryText,
          borderRadius: 2,
          bgcolor: ui.softBg,
          px: 1.4,
          py: 0.55,
          minHeight: 34,
          "&:hover": {
            borderColor: "#c8d6f0",
            bgcolor: ui.primaryBg,
          },
        }}
      >
        Quay lại các lớp học
      </Button>

      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}`, mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.25}>
            <Chip
              label={classInfo.className}
              sx={{
                width: "fit-content",
                bgcolor: ui.primaryBg,
                color: ui.primaryText,
                border: `1px solid ${ui.border}`,
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 500, color: ui.heading, letterSpacing: "0.1px" }}
            >
              {classInfo.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: ui.muted }}>
              <MeetingRoomRoundedIcon sx={{ fontSize: 18 }} />
              <Typography>Phòng {classInfo.room}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
          gap: 1.5,
          mb: 2,
        }}
      >
        {[
          { label: "Tiến độ", value: `${classInfo.progress}%` },
          { label: "Chuyên cần", value: `${classInfo.attendance}%` },
          { label: "Số buổi đã học", value: `${classInfo.completedLessons}/${classInfo.totalLessons}` },
          { label: "Bài tập chưa hoàn thành", value: classInfo.assignmentsPending },
        ].map((stat) => (
          <Card key={stat.label} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: ui.muted }}>
                {stat.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, mt: 0.5, color: ui.heading }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" },
          gap: 2,
        }}
      >
        <Stack spacing={2}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1.5, color: ui.heading }}>
                Tổng quan lớp học
              </Typography>
              <Typography sx={{ color: ui.text, mb: 2 }}>
                {classInfo.description}
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <PersonRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`Giáo viên: ${classInfo.teacher}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <EmailRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={`Email: ${classInfo.teacherEmail}`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1.5, color: ui.heading }}>
                Bài tập sắp tới
              </Typography>
              <Stack spacing={1.2}>
                {classInfo.assignments.map((assignment) => (
                  <Box
                    key={assignment.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${ui.softBorder}`,
                      bgcolor: ui.softBg,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 500, color: ui.heading }}>{assignment.title}</Typography>
                      <Typography variant="body2" sx={{ color: ui.muted }}>
                        Hạn nộp: {assignment.due}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={assignment.status}
                      sx={getAssignmentChipSx(assignment.status)}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={2}>
          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1.5, color: ui.heading }}>
                Lịch học sắp tới
              </Typography>
              <Stack spacing={1.2}>
                {classInfo.lessons.map((lesson) => (
                  <Box key={lesson.id} sx={{ borderLeft: `3px solid ${ui.primary}`, pl: 1.2 }}>
                    <Typography sx={{ fontWeight: 500, color: ui.heading }}>{lesson.title}</Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: ui.muted }} />
                      <Typography variant="body2" sx={{ color: ui.muted }}>
                        {lesson.time}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ui.border}` }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1.5, color: ui.heading }}>
                Tài liệu
              </Typography>
              <Stack spacing={1}>
                {classInfo.resources.map((resource) => (
                  <Stack key={resource} direction="row" spacing={1} alignItems="center">
                    <MenuBookRoundedIcon sx={{ fontSize: 18, color: ui.primaryText }} />
                    <Typography variant="body2" sx={{ color: ui.text }}>{resource}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
