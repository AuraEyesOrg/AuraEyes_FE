import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const SECTION_KEYS = [
  'miMat',
  'ketMac',
  'giacMac',
  'cungMac',
  'tienPhong',
  'mongMat',
  'theThuyTinh',
  'dichKinh',
  'vongMac',
];

export default function ErmFormPatient() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.formData || {});

  useEffect(() => {
    if (location.state?.formData) {
      setData(location.state.formData);
    }
  }, [location.state]);

  const handleChange = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving Staff ERM Data:', data);
    toast.success('Thông tin hành chính đã được lưu!');
  };

  const renderSquare = (checked: boolean, field?: string, value?: string) => (
    <span
      onClick={() => {
        if (field) {
          if (value) {
            handleChange(field, value);
          } else {
            handleChange(field, !checked);
          }
        }
      }}
      className="inline-flex items-center justify-center w-3.5 h-3.5 border border-black text-[11px] font-black mr-1 leading-none cursor-pointer"
    >
      {checked ? 'X' : ''}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 no-print text-black">
      {/* NAVIGATION */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 flex gap-4 no-print z-50 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="bg-white border border-black px-6 py-2 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> QUAY LẠI
        </button>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-8 py-2 font-bold text-xs flex items-center gap-2 hover:bg-primary/90 shadow-xl transition-all"
        >
          <Save className="w-4 h-4" /> LƯU THÔNG TIN
        </button>
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-8 py-2 font-bold text-xs flex items-center gap-2 hover:bg-slate-800 shadow-xl transition-all"
        >
          <Printer className="w-4 h-4" /> IN BỆNH ÁN
        </button>
      </div>

      <main className="max-w-[900px] mx-auto bg-white p-[60px] shadow-2xl print:p-0 print:shadow-none print:border-none border border-slate-300 font-serif leading-tight">
        {/* HEADER */}
        <div className="flex flex-col items-center relative mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight">
            BỆNH ÁN MẮT
          </h1>
          <p className="text-sm font-bold uppercase">(Đáy mắt)</p>

          <div className="absolute top-0 right-0 text-[11px] font-bold text-right space-y-0.5">
            <p>MS: 23/BV-01</p>
            <p>Số lưu trữ:....................................</p>
            <p>
              Mã YT:{' '}
              <input
                type="text"
                value={data.maYT || ''}
                onChange={(e) => handleChange('maYT', e.target.value)}
                className="w-40 border-b border-black outline-none bg-transparent"
                placeholder="...... /210/20......"
              />
            </p>
          </div>

          <div className="w-full flex justify-between text-[11px] font-bold mt-6">
            <p>
              Khoa:{' '}
              <input
                type="text"
                value={data.khoa || ''}
                onChange={(e) => handleChange('khoa', e.target.value)}
                className="border-b border-black w-[100px] text-center outline-none bg-transparent"
                placeholder="................"
              />{' '}
              Giường:{' '}
              <input
                type="text"
                value={data.giuong || ''}
                onChange={(e) => handleChange('giuong', e.target.value)}
                className="border-b border-black w-[80px] text-center outline-none bg-transparent"
                placeholder="............"
              />
            </p>
          </div>
        </div>

        {/* I. HÀNH CHÍNH */}
        <section className="space-y-1.5 mb-6">
          <div className="flex justify-between items-end border-b-2 border-black pb-0.5 mb-2">
            <h2 className="text-lg font-bold uppercase">I. HÀNH CHÍNH</h2>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span>Tuổi</span>
              <div className="flex gap-0.5">
                <span className="border border-black px-1.5 min-w-[20px] text-center">
                  {data.age?.charAt(0) || ' '}
                </span>
                <span className="border border-black px-1.5 min-w-[20px] text-center">
                  {data.age?.charAt(1) || ' '}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 text-[12.5px] font-medium leading-relaxed gap-y-1">
            <div className="col-span-8 flex items-end">
              1. Họ và tên:{' '}
              <input
                type="text"
                value={data.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="uppercase font-bold border-b border-black flex-1 ml-1 px-2 h-5 outline-none bg-transparent"
                placeholder="..………………………...................................."
              />
            </div>
            <div className="col-span-4 flex items-center justify-end gap-2">
              2. Ngày sinh{' '}
              <div className="flex gap-0.5">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px] ml-1">
                  {' '}
                </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px] ml-1">
                  {' '}
                </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              3. Giới: {renderSquare(data.gender === 'Nam', 'gender')} Nam{' '}
              {renderSquare(data.gender === 'Nữ', 'gender')} Nữ
              <span className="ml-10">4. Nghề nghiệp:</span>{' '}
              <input
                type="text"
                value={data.job || ''}
                onChange={(e) => handleChange('job', e.target.value)}
                className="border-b border-black flex-1 px-2 mx-2 h-5 outline-none bg-transparent"
                placeholder=".............................................."
              />
              <div className="flex gap-0.5">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              5. Dân tộc:{' '}
              <input
                type="text"
                value={data.ethnicity || ''}
                onChange={(e) => handleChange('ethnicity', e.target.value)}
                className="border-b border-black min-w-[120px] px-2 h-5 outline-none bg-transparent"
                placeholder="……………………………."
              />
              <div className="flex gap-0.5 mx-2">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
              6. Ngoại kiều:{' '}
              <input
                type="text"
                value={data.nationality || ''}
                onChange={(e) => handleChange('nationality', e.target.value)}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent"
                placeholder="................................................."
              />
              <div className="flex gap-0.5 ml-2">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              7. Địa chỉ:{' '}
              <input
                type="text"
                value={data.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent"
                placeholder="Số nhà …… Thôn, phố …… Xã, phường ……"
              />
            </div>
            <div className="col-span-12 flex items-center">
              Huyện (Quận, thị xã) …………….........….....…...{' '}
              <div className="flex gap-0.5 mx-2">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>{' '}
              Tỉnh (thành phố)
              ......................................................................{' '}
              <div className="flex gap-0.5 ml-2">
                <span className="border border-black px-1 min-w-[16px]"> </span>
                <span className="border border-black px-1 min-w-[16px]"> </span>
              </div>
            </div>

            <div className="col-span-12 flex items-center">
              8. Nơi làm việc:{' '}
              <input
                type="text"
                value={data.workplace || ''}
                onChange={(e) => handleChange('workplace', e.target.value)}
                className="border-b border-black flex-1 px-2 h-5 outline-none bg-transparent"
                placeholder=".................................................................."
              />
              <span className="ml-4 mr-2">
                9.{' '}
                <span className="bg-yellow-200 print:bg-transparent">Đối</span>{' '}
                tượng:
              </span>
              1.BHYT
              {renderSquare(data.objectType === 'BHYT', 'objectType', 'BHYT')}{' '}
              2.Thu phí
              {renderSquare(
                data.objectType === 'Thu phí',
                'objectType',
                'Thu phí'
              )}{' '}
              3.Miễn
              {renderSquare(data.objectType === 'Miễn', 'objectType', 'Miễn')}{' '}
              4.Khác
              {renderSquare(data.objectType === 'Khác', 'objectType', 'Khác')}
            </div>
            <div className="col-span-12">
              10.BHYT giá trị đến ngày…… tháng …… năm 20….. Số thẻ BHYT:
              ………..........................................…..………..
            </div>
            <div className="col-span-12">
              11. Họ tên, địa chỉ người nhà khi cần báo tin:
              ……..…………………………..........................................…..................
            </div>
            <div className="col-span-12">
              …………………………………………. Số điện thoại liên lạc:
              …………...........................................………………..
            </div>
          </div>
        </section>

        {/* II. QUẢN LÝ NGƯỜI BỆNH */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-0.5 mb-1">
            II. QUẢN LÝ NGƯỜI BỆNH
          </h2>
          <div className="border border-black text-[12px]">
            <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
              <div className="p-1.5 space-y-1">
                <p>
                  12. Vào viện ……. giờ…… phút ngày ….... / ….. /… ....... 13.
                </p>
                <p>
                  Trực tiếp vào: 1.Cấp cứu{renderSquare(false)} 2.KKB
                  {renderSquare(false)} 3.Khoa điều trị{renderSquare(false)}
                </p>
              </div>
              <div className="p-1.5 space-y-1">
                <p>
                  14. Nơi giới thiệu: 1. Cơ quan y tế{renderSquare(false)} 2.Tự
                  đến{renderSquare(false)} 3.Khác{renderSquare(false)}
                </p>
                <p>
                  - Vào viện{' '}
                  <span className="bg-yellow-200 print:bg-transparent px-1">
                    do
                  </span>{' '}
                  bệnh này lần thứ mấy {renderSquare(false)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-black min-h-[140px]">
              <div className="divide-y divide-black">
                <div className="p-1.5 h-14 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    15. Vào khoa{' '}
                    <div className="border border-black w-24 h-10 flex flex-col items-center justify-center font-bold text-[10px] uppercase">
                      <span className="border-b border-black w-full text-center">
                        Khoa
                      </span>
                      <span> </span>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-0.5 text-right font-bold">
                    <p>ng / th / năm Số ngày ĐT</p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                  </div>
                </div>
                <div className="p-1.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    16. Chuyển{' '}
                    <div className="border border-black w-24 h-10 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-tighter">
                      <span className="border-b border-black w-full text-center">
                        Khoa
                      </span>
                      <span> </span>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-1 text-right mt-2">
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                    <p>
                      Giờ......phút....../....../ ......{' '}
                      <span className="border border-black px-1.5 ml-1"> </span>
                      <span className="border border-black px-1.5"> </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 space-y-2">
                <p>
                  17. Chuyển viện: 1. Tuyến trên{renderSquare(false)} 2. Tuyến
                  dưới{renderSquare(false)} 3.CK{renderSquare(false)}
                </p>
                <p>
                  - Chuyển đến
                  ............................................................................
                </p>
                <p>
                  ...................................................................................................
                </p>
                <p className="mt-4">
                  18. Ra
                  viện............giờ............ngày........../.............../.................
                </p>
                <div className="flex gap-2 text-[10px] justify-center py-1">
                  1. Ra viện{renderSquare(false)} 2. Xin về{renderSquare(false)}{' '}
                  3. Bỏ về{renderSquare(false)} 4. Đưa về{renderSquare(false)}
                </div>
                <p className="mt-2 flex items-center gap-4">
                  19. Tổng số ngày điều trị.{' '}
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* III. CHẨN ĐOÁN */}
        <section className="mb-6">
          <div className="flex justify-between items-end border-b-2 border-black pb-0.5 mb-1">
            <h2 className="text-lg font-bold uppercase">
              III. CHẨN{' '}
              <span className="bg-yellow-200 print:bg-transparent">ĐOÁN</span>
            </h2>
            <div className="flex gap-32 mr-20 text-[11px] font-bold">
              <span>MÃ</span>
              <span>MÃ</span>
            </div>
          </div>

          <div className="border border-black text-[12px]">
            <div className="grid grid-cols-2 divide-x divide-black border-b border-black">
              <div className="p-2 space-y-2">
                <div className="flex justify-between">
                  <p>
                    20. Nơi chuyển
                    đến.................................................
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p>
                    21. KKB, Cấp
                    cứu....................................................
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p>
                    22. Khi vào khoa điều
                    trị.........................................
                  </p>
                  <div className="flex gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
                <p className="flex items-center gap-6 mt-2">
                  - Tai biến: {renderSquare(false)} - Biến chứng:{' '}
                  {renderSquare(false)}
                </p>
                <div className="grid grid-cols-2 text-[11px] gap-y-1 pl-4 mt-2 font-bold">
                  <p>
                    1.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Do
                    </span>{' '}
                    phẫu thuật {renderSquare(false)}
                  </p>
                  <p>
                    2.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Do
                    </span>{' '}
                    gây mê {renderSquare(false)}
                  </p>
                  <p>
                    3.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Do
                    </span>{' '}
                    nhiễm khuẩn {renderSquare(false)}
                  </p>
                  <p>4. Khác {renderSquare(false)}</p>
                </div>
              </div>
              <div className="p-2 space-y-2">
                <p className="font-bold">25. Ra viện</p>
                <div className="pl-2 space-y-1">
                  <p>+ Bệnh chính: (tổn thương)</p>
                  <p className="border-b border-black italic min-h-[20px] font-bold">
                    {data.finalDiagnosisMain ||
                      '........................................................................'}
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p className="text-center italic mt-1 text-[11px]">
                    (nguyên nhân)
                    ........................................................
                  </p>
                  <div className="flex justify-end gap-0.5 pr-10">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p className="mt-1">
                    + Bệnh kèm
                    theo..................................................................
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p>
                    + Chẩn{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      đoán
                    </span>{' '}
                    trước phẫu
                    thuật..............................................
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                  <p>
                    + Chẩn{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      đoán
                    </span>{' '}
                    sau phẫu thuật..............................................
                  </p>
                  <div className="flex justify-end gap-0.5">
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                    <span className="border border-black px-1.5"> </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-1 px-2 border-b border-black text-[11px] font-bold">
              <p>
                23. Tổng số ngày điều trị sau phẫu thuật:
                ..........................
              </p>
              <div className="flex gap-0.5">
                <span className="border border-black px-1.5"> </span>
                <span className="border border-black px-1.5"> </span>
                <span className="border border-black px-1.5"> </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-1 px-2 text-[11px] font-bold">
              <p>
                24. Tổng số lần phẫu thuật:
                ....................................................
              </p>
              <div className="flex gap-0.5 mr-28">
                <span className="border border-black px-1.5"> </span>
                <span className="border border-black px-1.5"> </span>
              </div>
            </div>
          </div>
        </section>

        {/* III. TÌNH TRẠNG RA VIỆN */}
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-0.5 mb-1">
            III. TÌNH TRẠNG RA VIỆN
          </h2>
          <div className="border border-black text-[12.5px]">
            <div className="grid grid-cols-2 divide-x divide-black h-20">
              <div className="p-2 space-y-1">
                <p className="font-bold mb-1">26. Kết quả điều trị</p>
                <div className="grid grid-cols-2 gap-y-1 pl-4">
                  <p>
                    1. Khỏi{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    4. Nặng hơn{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    2.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Đỡ
                    </span>
                    , giảm{' '}
                    <span className="border border-black px-2.5 ml-4"> </span>
                  </p>
                  <p>
                    5. Tử vong{' '}
                    <span className="border border-black px-2.5 ml-6"> </span>
                  </p>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="font-bold">
                  28. Tình hình tử vong: .........giờ. ........ phút
                  Ngày........tháng..........năm...........
                </p>
                <div className="flex gap-4 pl-4 mt-1">
                  <p>
                    1.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Do
                    </span>{' '}
                    bệnh {renderSquare(false)}
                  </p>
                  <p>
                    2.{' '}
                    <span className="bg-yellow-200 print:bg-transparent">
                      Do
                    </span>{' '}
                    tai biến điều trị {renderSquare(false)}
                  </p>
                  <p>3. Khác {renderSquare(false)}</p>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9.5px] pt-1.5 border-t border-black border-dotted mt-2 font-bold uppercase">
                  <p>1. Trong 24 giờ vào viện {renderSquare(false)}</p>
                  <p>2. trong 48 giờ vào viện {renderSquare(false)}</p>
                  <p>3. Trong 72 giờ vào viện {renderSquare(false)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-start mt-12 text-[14px] px-10">
            <div className="text-center w-64 space-y-20">
              <h3 className="font-bold text-base uppercase">
                Giám{' '}
                <span className="bg-yellow-200 print:bg-transparent">đốc</span>{' '}
                bệnh viện
              </h3>
              <p className="text-slate-400">
                Họ và
                tên...........................................................
              </p>
            </div>
            <div className="text-center w-64 space-y-20">
              <div className="space-y-1">
                <p className="italic text-[12px]">
                  Ngày........ tháng........ năm 20.......
                </p>
                <h3 className="font-bold text-base uppercase">Trưởng khoa</h3>
              </div>
              <p className="text-slate-400">
                Họ và
                tên...........................................................
              </p>
            </div>
          </div>
        </section>

        {/* PAGE 2: BỆNH ÁN CHI TIẾT */}
        <div className="pt-24 border-t-8 border-slate-100 break-before-page space-y-10">
          <h2 className="text-2xl font-bold text-center uppercase tracking-tight">
            A. BỆNH ÁN
          </h2>

          <div className="space-y-6 text-[14px] font-medium leading-relaxed px-2">
            <p>
              <span className="font-bold uppercase">
                I. LÝ{' '}
                <span className="bg-yellow-200 print:bg-transparent">DO</span>{' '}
                VÀO VIỆN:
              </span>{' '}
              <span className="border-b border-black flex-1 min-w-[400px] inline-block h-5 mx-2">
                {data.admissionReason ||
                  '...........................................................................'}
              </span>{' '}
              ngày thứ. .......... của bệnh
            </p>

            <div className="space-y-2">
              <p className="font-bold uppercase">II. HỎI BỆNH:</p>
              <div className="space-y-1">
                <p>1. Quá trình bệnh lý:</p>
                <div className="border-b border-black h-7 w-full"></div>
                <div className="border-b border-black h-7 w-full"></div>
                <div className="border-b border-black h-7 w-full"></div>
              </div>
              <div className="space-y-4 mt-4">
                <p>2. Tiền sử:</p>
                <p>
                  Bản thân:
                  <span className="border-b border-black block w-full h-8"></span>
                </p>
                <p>
                  Gia đình:
                  <span className="border-b border-black block w-full h-8"></span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-bold uppercase">III. KHÁM BỆNH</p>
              <p className="font-bold ml-6 underline">1. Khám chuyên khoa</p>

              <div className="border border-black overflow-hidden mx-4">
                <table className="w-full border-collapse">
                  <tr className="divide-x divide-black border-b border-black h-9 bg-slate-50/30">
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Thị lực vào viện: Không kính: MP..........MT........
                    </td>
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Nhãn áp vào viện MP............... MT..............
                    </td>
                  </tr>
                  <tr className="divide-x divide-black h-9">
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Có kính : MP..........MT.........
                    </td>
                    <td className="w-1/2 px-3 text-[12px] font-bold">
                      Thị trường MP............... MT...............
                    </td>
                  </tr>
                </table>
              </div>

              {/* SIDE BY SIDE TABLE */}
              <div className="border border-black mx-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="divide-x divide-black border-b border-black font-bold uppercase text-center h-10 bg-slate-50/50">
                      <th className="w-1/2 text-base">MẮT PHẢI</th>
                      <th className="w-1/2 text-base">MẮT TRÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black text-[12px] leading-snug">
                    {[
                      {
                        id: 1,
                        label: 'Mi mắt',
                        options:
                          'Bình thường □ Phù nề □ Phản ứng thể mi □ Bệnh lý khác...',
                      },
                      {
                        id: 2,
                        label: 'Kết mạc',
                        options:
                          'Bình thường □ Cương tụ nông □ Cương tụ sâu □ Xuất huyết □ .....................Sẹo KM □ ...................... Bệnh lý khác:...',
                      },
                      {
                        id: 3,
                        label: 'Giác mạc',
                        options:
                          '- Trong □ Sẹo □ Phù □ - Tủa mặt sau: Tủa mới □ Tủa mỡ cừu □ Tủa sắc tố □ Tủa cũ □ Vị trí tủa: .................... - Sẹo GM □ Bệnh lý khác...',
                      },
                      {
                        id: 4,
                        label: 'Củng mạc',
                        options: '- Bình thường □ Sẹo CM □ - Bệnh lý khác: ...',
                      },
                      {
                        id: 5,
                        label: 'Tiền phòng',
                        options:
                          'Sâu sạch □ Xẹp tiền phòng □ Xuất huyết □ Độ.................... Mủ, xuất tiết □ Mức độ.................... Tyndall □ Độ .................... Góc tiền phòng: Dính □ Sắc tố □ Tân mạch □ Tổn thương khác:...',
                      },
                      {
                        id: 6,
                        label: 'Mống mắt',
                        options:
                          'Bình thường □ Thoái hóa □ Tân mạch □...............Hạt Koeppi □ ................ Hạt Busaca □ .................... Đồng tử: Ánh đồng tử................. Kích thước .......... mm. Tròn □ Méo □ Dính □ vị trí.................... PXĐT: Có □ Không □ Giãn liệt □ Bệnh lý khác: ...',
                      },
                      {
                        id: 7,
                        label: 'Thể thủy tinh',
                        options:
                          'Trong □ Đục □ Đục vỡ T3 □ Sa lệch □ Ra tiền phòng □ Vào buồng dịch kính □ Dính sắc tố mặt trước □ Viêm mủ □ Tổn thương khác: ...',
                      },
                      {
                        id: 8,
                        label: 'Dịch kính',
                        options:
                          'Sạch □ Tyndall □ <span className="bg-yellow-200">Độ</span>.................... Viêm mủ □ .................... Xuất huyết □ Tổ chức hóa □ Bong dịch kính sau □ Tổn thương khác:...',
                      },
                    ].map((row) => (
                      <tr
                        key={row.id}
                        className="divide-x divide-black h-24 align-top"
                      >
                        <td className="p-2 relative">
                          <p className="font-bold leading-relaxed">
                            {row.id}. {row.label}{' '}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: row.options.replace(
                                  'class=',
                                  'className='
                                ),
                              }}
                            />
                          </p>
                          <div className="mt-4 border-b border-black border-dotted h-4 w-full"></div>
                        </td>
                        <td className="p-2 relative">
                          <p className="font-bold leading-relaxed">
                            {row.id}. {row.label}{' '}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: row.options.replace(
                                  'class=',
                                  'className='
                                ),
                              }}
                            />
                          </p>
                          <div className="mt-4 border-b border-black border-dotted h-4 w-full"></div>
                        </td>
                      </tr>
                    ))}
                    {/* Section 9: Võng mạc is extra tall */}
                    <tr className="divide-x divide-black align-top">
                      <td className="p-2">
                        <p className="font-bold uppercase tracking-tight border-b border-black/10 pb-1">
                          9. Võng mạc: Hệ mạch: Bình thường □
                        </p>
                        <div className="pl-12 text-[11px] space-y-1 mt-1">
                          <p>Tắc ĐM : trung tâm □ nhánh □ mi VM □</p>
                          <p>Tắc TM : trung tâm □ nhánh □</p>
                          <p className="pl-16 font-bold">
                            phù □ thiếu máu □ hỗn hợp □
                          </p>
                          <p>Viêm mao mạch □ Tân mạch võng mạc □</p>
                          <p>Tân mạch hắc mạc: dưới HĐ □ ngoài HĐ □</p>
                        </div>
                        <p className="font-bold text-[11px] mt-2 border-t border-black/10 pt-1">
                          Đĩa thị: Bình thường □ Phù □ Teo □ Bạc màu□
                        </p>
                        <p className="text-[11px]">
                          Tân mạch gai □ &lt;1/4 gai□ 1/4 -1/2gai □ &gt; 1/2 gai
                          □
                        </p>
                        <p className="font-bold text-[11px] mt-1">
                          Hoàng điểm: Bình thường □ Mất ánh HĐ □
                        </p>
                        <p className="pl-16 text-[11px]">
                          Phù : Khu trú □ Tỏa lan □
                        </p>
                        <p className="text-[11px]">
                          Lỗ: <span className="bg-yellow-200">Độ</span>.
                          .................... lỗ lớp □ giả lỗ □
                        </p>
                        <p className="text-[11px]">Sẹo HĐ có □ không□</p>
                        <p className="font-bold text-[11px] mt-1">
                          Thoái hóa VM: chu biên □ trung tâm □
                        </p>
                        <p className="text-[11px] border-b border-black border-dotted h-5"></p>
                      </td>
                      <td className="p-2">
                        <p className="font-bold uppercase tracking-tight border-b border-black/10 pb-1">
                          9. Võng mạc: Hệ mạch: Bình thường □
                        </p>
                        <div className="pl-12 text-[11px] space-y-1 mt-1">
                          <p>Tắc ĐM : trung tâm □ nhánh □ mi VM □</p>
                          <p>Tắc TM : trung tâm □ nhánh □</p>
                          <p className="pl-16 font-bold">
                            phù □ thiếu máu □ hỗn hợp □
                          </p>
                          <p>Viêm mao mạch □ Tân mạch võng mạc □</p>
                          <p>Tân mạch hắc mạc: dưới HĐ □ ngoài HĐ □</p>
                        </div>
                        <p className="font-bold text-[11px] mt-2 border-t border-black/10 pt-1">
                          Đĩa thị: Bình thường □ Phù □ Teo □ Bạc màu□
                        </p>
                        <p className="text-[11px]">
                          Tân mạch gai □ &lt;1/4 gai□ 1/4 -1/2gai □ &gt; 1/2 gai
                          □
                        </p>
                        <p className="font-bold text-[11px] mt-1">
                          Hoàng điểm: Bình thường □ Mất ánh HĐ □
                        </p>
                        <p className="pl-16 text-[11px]">
                          Phù : Khu trú □ Tỏa lan □
                        </p>
                        <p className="text-[11px]">
                          Lỗ: <span className="bg-yellow-200">Độ</span>.
                          .................... lỗ lớp □ giả lỗ □
                        </p>
                        <p className="text-[11px]">Sẹo HĐ có □ không□</p>
                        <p className="font-bold text-[11px] mt-1">
                          Thoái hóa VM: chu biên □ trung tâm □
                        </p>
                        <p className="text-[11px] border-b border-black border-dotted h-5"></p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body { background: white !important; font-family: "Times New Roman", Times, serif !important; }
            .no-print { display: none !important; }
            main { border: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; box-shadow: none !important; }
            .break-before-page { page-break-before: always; }
          }
          main {
            font-family: "Times New Roman", Times, serif;
          }
          .divide-x > * + * { border-left-width: 1px; }
          .divide-y > * + * { border-top-width: 1px; }
        `}</style>
      </main>
    </div>
  );
}
