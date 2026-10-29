# Hệ thống quản lý món ăn

Học phần: Điện toán đám mây
Sinh viên: Trinh Hoang Dinh - MSSV 235951

## Mô tả đề tài
Ứng dụng quản lý món ăn (thêm, xem, tìm kiếm, cập nhật, xóa) triển khai trên nền tảng đám mây.

## Công nghệ
React, Node.js, Express, MongoDB Atlas, Git/GitHub, Docker, Docker Hub, Render.

## Cấu trúc dự án
- `backend/`: API Node.js + Express
- `frontend/`: giao diện React

## Hướng dẫn cài đặt và chạy
Sẽ được cập nhật ở các câu sau.

## Liên kết triển khai
Sẽ được cập nhật sau khi triển khai.

## Chay backend bang Docker

```bash
cd backend
docker build -t trinhhoangdinh/backend .
docker run -p 5001:5001 -e PORT=5001 -e MONGO_URI="<chuoi-ket-noi-mongodb>" trinhhoangdinh/backend
```

Image: https://hub.docker.com/r/trinhhoangdinh/backend

## Chay frontend bang Docker

```bash
cd frontend
docker build --build-arg VITE_API_URL=https://two35951-trinhhoangdinh.onrender.com -t trinhhoangdinh/frontend .
docker run -p 8080:80 trinhhoangdinh/frontend
```

Image: https://hub.docker.com/r/trinhhoangdinh/frontend
