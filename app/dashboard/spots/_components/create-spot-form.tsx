"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SPOT_TYPES, SPOT_DIFFICULTIES, SpotType, SpotDifficulty } from "@/lib/types/spots";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface FormData {
  name: string;
  description: string;
  locationLat: string;
  locationLng: string;
  spotType: SpotType | "";
  difficulty: SpotDifficulty | "";
  bestTimes: string;
  safetyNotes: string;
}

interface ApiResponse {
  id: string;
  name: string;
  spotType: string;
  difficulty: string;
  status: string;
  createdAt: string;
}

export default function CreateSpotForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    locationLat: "",
    locationLng: "",
    spotType: "",
    difficulty: "",
    bestTimes: "",
    safetyNotes: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
    data?: ApiResponse;
  } | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear previous result when user starts typing
    if (result) setResult(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.locationLat.trim()) return "Latitude is required";
    if (!formData.locationLng.trim()) return "Longitude is required";
    if (!formData.spotType) return "Spot type is required";
    if (!formData.difficulty) return "Difficulty is required";

    const lat = parseFloat(formData.locationLat);
    const lng = parseFloat(formData.locationLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return "Latitude must be a number between -90 and 90";
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return "Longitude must be a number between -180 and 180";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setResult({
          type: "error",
          message: validationError,
        });
        return;
      }

      // Prepare API payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        locationLat: parseFloat(formData.locationLat),
        locationLng: parseFloat(formData.locationLng),
        spotType: formData.spotType,
        difficulty: formData.difficulty,
        bestTimes: formData.bestTimes.trim() || undefined,
        safetyNotes: formData.safetyNotes.trim() || undefined,
      };

      // Make API call
      const response = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Success!
      setResult({
        type: "success",
        message: "Spot created successfully!",
        data: responseData,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        locationLat: "",
        locationLng: "",
        spotType: "",
        difficulty: "",
        bestTimes: "",
        safetyNotes: "",
      });

    } catch (error) {
      console.error("Error creating spot:", error);
      setResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to create spot. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Longboarding Spot</CardTitle>
          <CardDescription>
            Fill in the details below to create a new spot. All required fields are marked with *.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Golden Gate Hill Bomb"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the spot, terrain, and what makes it special..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="37.7749"
                  value={formData.locationLat}
                  onChange={(e) => handleInputChange("locationLat", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="-122.4194"
                  value={formData.locationLng}
                  onChange={(e) => handleInputChange("locationLng", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Spot Type and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spotType">Spot Type *</Label>
                <Select
                  value={formData.spotType}
                  onValueChange={(value) => handleInputChange("spotType", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spot type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPOT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange("difficulty", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPOT_DIFFICULTIES.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Best Times */}
            <div className="space-y-2">
              <Label htmlFor="bestTimes">Best Times to Ride</Label>
              <Input
                id="bestTimes"
                placeholder="e.g., Early morning, weekends, after 6pm"
                value={formData.bestTimes}
                onChange={(e) => handleInputChange("bestTimes", e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Safety Notes */}
            <div className="space-y-2">
              <Label htmlFor="safetyNotes">Safety Notes</Label>
              <Textarea
                id="safetyNotes"
                placeholder="Any safety considerations, traffic warnings, or protective gear recommendations..."
                value={formData.safetyNotes}
                onChange={(e) => handleInputChange("safetyNotes", e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Spot...
                </>
              ) : (
                "Create Spot"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Alert className={result.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {result.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={result.type === "success" ? "text-green-800" : "text-red-800"}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Details */}
      {result?.type === "success" && result.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Created Spot Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">ID</dt>
                <dd className="font-mono">{result.data.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd>{result.data.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Type</dt>
                <dd className="capitalize">{result.data.spotType}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Difficulty</dt>
                <dd className="capitalize">{result.data.difficulty}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd className="capitalize">{result.data.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Created</dt>
                <dd>{new Date(result.data.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}