import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Send, Camera, Image, SparklesIcon, Wallet } from "lucide-react";
import onePostNftLogo from "@/Images/baselogo.png";
import { useAppContext } from "@/context/AppContext";
import { useCamera } from "@/hooks/useCamera";
import { usePostNFT } from "@/hooks/usePostNFT";
import { toast } from "sonner";
import EmojiPickerComponent from "./EmojiPicker";
import ConnectWalletButton from "@/components/Wallet/ConnectWalletButton";
import { useAccount } from "wagmi";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess?: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostSuccess,
}) => {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("text");

  const { createPost, state } = useAppContext();
  const { mintPost, isLoading: isMinting } = usePostNFT();
  const { address } = useAccount(); // For Base transactions
  const {
    videoRef,
    isActive: isCameraActive,
    startCamera,
    stopCamera,
    capturePhoto,

    isSupported: isCameraSupported,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const MAX_CHARS = 280;
  const remainingChars = MAX_CHARS - content.length;

  // Auto-start camera when switching to camera tab
  const handleStartCamera = useCallback(async () => {
    const success = await startCamera();
    if (success) {
      setActiveTab("camera");
    }
  }, [startCamera]);

  const handleCapturePhoto = useCallback(() => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      stopCamera();
      setActiveTab("preview");
    }
  }, [capturePhoto, stopCamera]);

  useEffect(() => {
    if (activeTab === "camera" && !isCameraActive && isCameraSupported) {
      handleStartCamera();
    }

    // Stop camera when switching away from camera tab
    if (activeTab !== "camera" && isCameraActive) {
      stopCamera();
    }
  }, [
    activeTab,
    isCameraActive,
    isCameraSupported,
    handleStartCamera,
    stopCamera,
  ]);

  // Focus the textarea when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!content.trim() && !capturedImage) {
      return "Please add some content or an image to your post";
    }
    if (content.length > MAX_CHARS) {
      return `Content must be less than ${MAX_CHARS} characters`;
    }
    if (
      content.trim().length > 0 &&
      content.trim().length < 3 &&
      !capturedImage
    ) {
      return "Content must be at least 3 characters long";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    try {
      // Use the actual content, allow empty content for image-only posts
      const finalContent = content.trim();

      const result = await mintPost(
        finalContent,
        capturedImage || undefined,
        () => {
          // Success callback - redirect to home
          setContent("");
          setCapturedImage(null);
          setError(null);
          onClose();
          if (onPostSuccess) {
            onPostSuccess();
          }
        }
      );

      if (result) {
        // Transaction submitted successfully
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    setError(null);
  };

  // (moved implementations to memoized callbacks above)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setActiveTab("preview");
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setContent("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center">
              <img
                src={onePostNftLogo}
                alt="Create Post"
                className="w-full h-full object-cover"
              />
            </div>
            Create Your Daily NFT Post
          </DialogTitle>
          <DialogDescription>
            Share your daily moment and mint it as an NFT on Base
          </DialogDescription>
        </DialogHeader>

        {!address ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Please connect your wallet to create and mint NFT posts
            </p>
            <ConnectWalletButton />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="camera" disabled={!isCameraSupported}>
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="preview" disabled={!capturedImage}>
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="relative">
                <label htmlFor="create-post-content" className="sr-only">
                  Post content
                </label>
                <Textarea
                  id="create-post-content"
                  ref={textareaRef}
                  placeholder="What's on your mind today? This post will become your unique NFT..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`min-h-[120px] resize-none border-border bg-background ${
                    error ? "border-destructive ring-1 ring-destructive" : ""
                  }`}
                  maxLength={MAX_CHARS}
                  aria-describedby="create-post-desc create-post-chars"
                />
                <p id="create-post-desc" className="sr-only">
                  You may add text or an image to mint as an NFT. Maximum{" "}
                  {MAX_CHARS} characters.
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        aria-expanded={showEmojiPicker}
                        aria-controls="emoji-picker"
                        aria-label={
                          showEmojiPicker
                            ? "Close emoji picker"
                            : "Open emoji picker"
                        }
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                    {error && (
                      <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <Badge
                    id="create-post-chars"
                    variant={
                      remainingChars < 0
                        ? "destructive"
                        : remainingChars < 20
                        ? "outline"
                        : "secondary"
                    }
                    className={
                      remainingChars < 20 && remainingChars >= 0
                        ? "text-orange-500 border-orange-500"
                        : ""
                    }
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {remainingChars} chars{" "}
                    {remainingChars === 0 && " (Limit reached)"}
                  </Badge>
                </div>

                {showEmojiPicker && (
                  <div
                    id="emoji-picker"
                    className="absolute top-full left-0 z-50 mt-2"
                  >
                    <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="camera" className="space-y-4">
              <Card className="p-4 bg-background">
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover rounded-lg bg-black"
                      aria-label="Camera preview"
                      role="img"
                      style={{ backgroundColor: "#000" }}
                    />
                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-white text-center space-y-3">
                          <Camera className="w-12 h-12 mx-auto animate-pulse" />
                          <div>
                            <p className="font-medium">Starting camera...</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Please allow camera access
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>📸 Position yourself and click capture when ready</p>
                    <p className="text-xs mt-1">
                      No filters applied - just you!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleCapturePhoto}
                      disabled={!isCameraActive}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      aria-label={
                        isCameraActive ? "Capture photo" : "Camera starting"
                      }
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCameraActive ? "Capture Photo" : "Starting..."}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("text")}
                      className="sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card className="p-4 bg-background">
                <div className="text-center space-y-4">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Upload Image</h3>
                    <p className="text-sm text-muted-foreground">
                      Select an image from your device (max 2MB)
                    </p>
                  </div>
                  <label
                    htmlFor="create-post-file"
                    className="inline-flex items-center justify-center px-4 py-2 rounded bg-accent text-white cursor-pointer"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Choose Image
                  </label>
                  <input
                    id="create-post-file"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                    aria-label="Upload image to attach to post"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {capturedImage && (
                <Card className="p-4 bg-background">
                  <div className="space-y-4">
                    <img
                      src={capturedImage}
                      alt="Captured preview of the image to attach to the post"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCapturedImage(null);
                          setActiveTab("camera");
                        }}
                        aria-label="Retake photo"
                      >
                        Retake
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCapturedImage(null)}
                        aria-label="Remove photo"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            {content.trim() && (
              <Card className="p-4 bg-muted border-border animate-fade-in">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  NFT Preview:
                </h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {content}
                </p>
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Attached"
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}
              </Card>
            )}

            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  (!content.trim() && !capturedImage) ||
                  remainingChars < 0 ||
                  isMinting
                }
                className="flex-1 bg-primary hover:bg-primary/90 animate-scale-in"
                aria-label="Post and mint NFT"
              >
                <Send className="w-4 h-4 mr-2" />
                {isMinting ? "Minting NFT..." : "Post & Mint NFT"}
              </Button>

              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
