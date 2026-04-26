# Activity Diagram: Consultation Flow (Luồng khám và tư vấn)

Sơ đồ hoạt động dưới đây mô tả toàn bộ luồng quy trình khám chữa bệnh thực tế tại **AuraEyes Digital Clinic**. Quy trình bắt đầu từ lúc bệnh nhân bước vào phòng khám, trải qua các bước Check-in, Chụp ảnh võng mạc & AI, Khám bệnh, Tính phí, và kết thúc ở bước Thanh toán thu ngân.

Sơ đồ được thiết kế theo dạng **Swimlanes** (Phân khu theo vai trò), tập trung vào các tác nhân con người vận hành phòng khám:

1. **Patient (Bệnh nhân)**
2. **Receptionist (Lễ tân)**
3. **Coordinator (Điều phối viên)**
4. **Ophthalmologist (Bác sĩ Nhãn khoa)**
5. **Cashier (Thu ngân)**

```mermaid
flowchart TD
    %% Định nghĩa Style cho các khối
    classDef startEnd fill:#333,stroke:#333,stroke-width:2px,color:#fff,rx:20,ry:20;
    classDef action fill:#e1f5fe,stroke:#01579b,stroke-width:1px,color:#000;
    classDef decision fill:#fff9c4,stroke:#fbc02d,stroke-width:1px,color:#000;

    Start([Bắt đầu]):::startEnd
    End([Kết thúc]):::startEnd

    subgraph Patient [Bệnh nhân]
        P1[Đến phòng khám]:::action
        P2[Nhận hóa đơn, đơn thuốc và ra về]:::action
    end

    subgraph Receptionist [Lễ tân]
        R1[Tiếp nhận bệnh nhân]:::action
        R2{Có lịch hẹn trước?}:::decision
        R3[Tạo hồ sơ & Lịch hẹn Walk-in]:::action
        R4[Thực hiện Check-in]:::action
    end

    subgraph Coordinator [Điều phối viên]
        CO1[Tiếp nhận bệnh nhân sau Check-in]:::action
        CO2[Chụp ảnh võng mạc]:::action
        CO3[Chạy phân tích AI trên ảnh chụp]:::action
        CO4[Chuyển kết quả AI & Bệnh án cho Bác sĩ]:::action
    end

    subgraph Ophthalmologist [Bác sĩ Nhãn khoa]
        D1[Gọi bệnh nhân vào phòng khám]:::action
        D2[Đọc và đánh giá kết quả phân tích AI]:::action
        D3[Khám mắt lâm sàng & Chẩn đoán]:::action
        D4[Cập nhật Hồ sơ bệnh án]:::action
        D5[Kê đơn thuốc / Chỉ định cắt kính]:::action
        D6[Kết thúc phiên khám]:::action
    end

    subgraph Cashier [Thu ngân]
        C1[Kiểm tra hồ sơ & Lập Hóa đơn]:::action
        C2[Thông báo chi phí & Thu tiền]:::action
        C3[Xác nhận thanh toán thành công]:::action
    end

    %% Luồng thực thi
    Start --> P1
    P1 --> R1

    R1 --> R2
    R2 -- "Không" --> R3
    R2 -- "Có" --> R4
    R3 --> R4

    R4 --> CO1
    CO1 --> CO2
    CO2 --> CO3
    CO3 --> CO4

    CO4 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> D5
    D5 --> D6

    D6 --> C1
    C1 --> C2
    C2 --> C3

    C3 --> P2
    P2 --> End
```
