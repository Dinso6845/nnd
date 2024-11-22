<?php
include('connect.php');
$conn = dbconnect();
header('Content-Type: application/json'); 
header('Access-Control-Allow-Origin: *'); 

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid HTTP method']);
        exit;
    }

    $inputData = json_decode(file_get_contents('php://input'), true);

    if (isset($inputData['qrcode']) && !empty($inputData['qrcode'])) {
        $qrcode = trim($inputData['qrcode']);

        if ($conn->connect_error) {
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
            exit;
        }

        $stmt = $conn->prepare("SELECT em_roomNo, em_meterID FROM electricity WHERE em_sum = ?");
        $stmt->bind_param("s", $qrcode); // ตรวจสอบ qrcode ใน em_sum
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'em_roomNo' => $row['em_roomNo'],
                    'em_meterID' => $row['em_meterID']
                ]
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No data found']);
        }

        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'QR code is required']);
    }

    $conn->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
