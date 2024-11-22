document.addEventListener('DOMContentLoaded', function () {
    var resultContainer = document.getElementById('qr-reader-results');
    var lastResult, countResults = 0;

    // สร้างตัว scanner ของ QR Code
    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", { fps: 10, qrbox: 250 });

    // ฟังก์ชันเมื่อสแกน QR สำเร็จ
    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText !== lastResult) {
            ++countResults;
            lastResult = decodedText;
            console.log(`ผลลัพธ์จากการสแกน = ${decodedText}`, decodedResult);

            // แสดงผลในผลลัพธ์
            resultContainer.innerHTML = `<div>[${countResults}] - ${decodedText}</div>`;

            // ใส่ข้อมูลลงในช่อง input1
            document.getElementById("input1").value = decodedText;

            // กำหนด input1, input2, input3 ให้เป็น readonly
            document.getElementById("input1").setAttribute("readonly", true);
            document.getElementById("input2").setAttribute("readonly", true);
            document.getElementById("input3").setAttribute("readonly", true);

            // เรียกฟังก์ชันเพื่อดึงข้อมูลจากฐานข้อมูล
            fetchData(decodedText);
        }
    }

    // ฟังก์ชันสำหรับดึงข้อมูลจากฐานข้อมูล
    function fetchData(qrcode) {
        console.log('Sending QR code:', qrcode); // Debug เพื่อดู QR Code ที่ส่งไป
        fetch('../backend/home.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ qrcode: qrcode }) // ส่งค่า QR Code ในรูป JSON
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // แปลงข้อมูลเป็น JSON
        })
        .then(data => {
            console.log('Response from backend:', data); // Debug เพื่อดูข้อมูลที่ส่งกลับมา
            if (data.status === 'success') {
                // อัปเดตช่อง Input ด้วยข้อมูลที่ดึงมา
                document.getElementById("input2").value = data.data.em_roomNo || '';
                document.getElementById("input3").value = data.data.em_meterID || '';
            } else {
                console.error("Error:", data.message); // แสดงข้อความ Error
                alert("ไม่พบข้อมูล: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error); // Debug ข้อผิดพลาดจาก fetch
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        });
    }

    // ฟังก์ชันสำหรับข้อผิดพลาด
    function onScanError(qrCodeError) {
        console.error(`ข้อผิดพลาดจากการสแกน QR: ${qrCodeError}`);
    }

    // เริ่มการแสดงผล
    html5QrcodeScanner.render(onScanSuccess, onScanError);

    // ฟังก์ชันเมื่อกดปุ่ม Submit
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click", function () {
        // ดึงค่าจาก input4
        const em_addNumber = document.getElementById("input4").value;
        const em_timestamp = new Date().toISOString(); // เก็บวันที่และเวลาเป็น ISO String
    
        // ดึงค่าจาก input1 (QR Code ที่สแกนมา)
        const em_qrcode = document.getElementById("input1").value;
    
        // ตรวจสอบว่า input4 มีค่าไหม
        if (!em_addNumber) {
            alert("กรุณากรอกหมายเลขเพิ่มเติม");
            return;
        }
    
        // ส่งข้อมูลไปยัง PHP เพื่ออัปเดตในฐานข้อมูล
        fetch('../backend/updateMeter.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qrcode: em_qrcode,
                addNumber: em_addNumber,
                timestamp: em_timestamp
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert('ข้อมูลได้ถูกบันทึกเรียบร้อยแล้ว');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        })
        .catch(error => {
            console.error('Error submitting data:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        });
    });    
});
