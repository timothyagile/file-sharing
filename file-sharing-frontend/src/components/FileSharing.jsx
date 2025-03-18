import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

const FileSharing = () => {
  const [peerId, setPeerId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);
  const [file, setFile] = useState(null);
  const [receivedFile, setReceivedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("connection", (conn) => {
      setConnection(conn);
      setIsConnected(true);

      conn.on("data", (data) => {
        if (data.file) {
          const fileBlob = new Blob([data.file]);
          const fileUrl = window.URL.createObjectURL(fileBlob);
          setReceivedFile({ url: fileUrl, fileName: data.fileName });
        }
      });
    });

    return () => newPeer.destroy();
  }, []);

  const connectToPeer = () => {
    if (!partnerId) return;
    const conn = peer.connect(partnerId);

    conn.on("open", () => {
      setConnection(conn);
      setIsConnected(true);
      alert("Kết nối thành công với Peer khác!");
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const sendFile = () => {
    if (!file || !connection) return;

    connection.send({ file: file, fileName: file.name });
    alert("Đã gửi file thành công!");
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Ứng dụng chia sẻ file P2P với PeerJS</h2>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mb-6">
        <p className="mb-2">
          <strong>Your Peer ID:</strong>{" "}
          <span className="text-blue-500">{peerId}</span>
        </p>

        <input
          type="text"
          placeholder="Nhập ID của người nhận"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className={`border ${
            isConnected ? "border-green-500 bg-green-100" : "border-gray-300"
          } rounded-md p-2 mb-4 w-full focus:outline-none focus:ring-2 ${
            isConnected ? "focus:ring-green-400" : "focus:ring-blue-400"
          }`}
        />
        <button
          onClick={connectToPeer}
          className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 w-full hover:bg-blue-600 transition-all"
        >
          Kết nối
        </button>

        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <span
          className="block w-full bg-purple-500 text-white text-center py-2 rounded-md cursor-pointer hover:bg-purple-600 transition-all mb-4"
          onClick={triggerFileInput}
        >
          📁 Chọn tệp
        </span>
        {file && (
          <p className="mt-2 text-gray-600">
            <strong>Tệp đã chọn:</strong> {file.name}
          </p>
        )}

        <button
          onClick={sendFile}
          className="bg-green-500 text-white px-4 py-2 rounded-md w-full hover:bg-green-600 transition-all"
        >
          Gửi file
        </button>
      </div>

      {receivedFile && (
        <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">📥 File đã nhận:</h3>
          <p className="mb-2">
            <strong>Tên file:</strong> {receivedFile.fileName}
          </p>
          <a
            href={receivedFile.url}
            download={receivedFile.fileName}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
          >
            Tải file
          </a>
        </div>
      )}
    </div>
  );
};

export default FileSharing;
