#!/bin/bash
echo "Đang đợi SQL Server khởi động..."

for i in {1..50}; do
    /opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P 'GymAppPassword123!' -C -Q "SELECT 1" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ SQL Server đã sẵn sàng! Bắt đầu tạo database QuanLyPhongGym..."
        /opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P 'GymAppPassword123!' -C -i /full_database.sql
        echo "🎉 Đã nạp thành công dữ liệu CSDL QuanLyPhongGym!"
        exit 0
    fi
    echo "Đang đợi SQL Server sẵn sàng ($i/50)..."
    sleep 2
done

echo "❌ Hết thời gian chờ SQL Server khởi động."
exit 1
