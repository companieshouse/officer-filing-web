import * as otel from "../src/otel";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { beforeEach, describe, expect, it, jest, afterAll } from "@jest/globals";

jest.mock("@opentelemetry/sdk-node");
jest.mock("@opentelemetry/auto-instrumentations-node", () => ({
    getNodeAutoInstrumentations: jest.fn(() => "instrumentations-mock")
}));
jest.mock("@opentelemetry/exporter-trace-otlp-proto");
jest.mock("@opentelemetry/exporter-metrics-otlp-proto");
jest.mock("@opentelemetry/sdk-metrics");
jest.mock("@opentelemetry/baggage-span-processor");
jest.mock("@opentelemetry/sdk-trace-node");

describe("otel.ts", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it("should configure OTLP exporters with correct endpoints", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "false";
        jest.resetModules();
        require("../src/otel");

        expect(OTLPTraceExporter).toHaveBeenCalledWith({
            url: "http://localhost:4318/v1/traces",
            headers: {}
        });
        expect(OTLPMetricExporter).toHaveBeenCalledWith({
            url: "http://localhost:4318/v1/metrics",
            headers: {}
        });
    });

    it("should instantiate NodeSDK with correct configuration", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "false";
        jest.resetModules();
        require("../src/otel");

        expect(NodeSDK).toHaveBeenCalledWith(
            expect.objectContaining({
                spanProcessors: [
                    expect.any(BaggageSpanProcessor),
                    expect.any(BatchSpanProcessor)
                ],
                metricReader: expect.any(PeriodicExportingMetricReader),
                instrumentations: ["instrumentations-mock"]
            })
        );
    });

    it("should start the SDK if OTEL_LOG_ENABLED is true", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "true";
        const startMock = jest.fn();
        (NodeSDK as jest.Mock).mockImplementation(() => ({
            start: startMock
        }));
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        jest.resetModules();
        require("../src/otel");

        expect(consoleSpy).toHaveBeenCalledWith("Staring OpenTelemetry SDK...");
        expect(startMock).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it("should not start the SDK if OTEL_LOG_ENABLED is not true", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "false";
        const startMock = jest.fn();
        (NodeSDK as jest.Mock).mockImplementation(() => ({
            start: startMock
        }));
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        jest.resetModules();
        require("../src/otel");

        expect(consoleSpy).not.toHaveBeenCalled();
        expect(startMock).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});