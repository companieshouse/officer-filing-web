import * as otelModule from "../src/otel";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("otel.ts", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let NodeSDKMock: jest.Mock;
    let BaggageSpanProcessorMock: jest.Mock;
    let BatchSpanProcessorMock: jest.Mock;
    let PeriodicExportingMetricReaderMock: jest.Mock;
    let OTLPTraceExporterMock: jest.Mock;
    let OTLPMetricExporterMock: jest.Mock;
    let getNodeAutoInstrumentationsMock: jest.Mock;

    beforeEach(() => {
        originalEnv = { ...process.env };
        NodeSDKMock = jest.fn().mockImplementation(() => ({ start: jest.fn() }));
        BaggageSpanProcessorMock = jest.fn();
        BatchSpanProcessorMock = jest.fn();
        PeriodicExportingMetricReaderMock = jest.fn();
        OTLPTraceExporterMock = jest.fn();
        OTLPMetricExporterMock = jest.fn();
        getNodeAutoInstrumentationsMock = jest.fn();

        jest.resetModules();
        jest.doMock("@opentelemetry/sdk-node", () => ({ NodeSDK: NodeSDKMock }));
        jest.doMock("@opentelemetry/auto-instrumentations-node", () => ({ getNodeAutoInstrumentations: getNodeAutoInstrumentationsMock }));
        jest.doMock("@opentelemetry/exporter-trace-otlp-proto", () => ({ OTLPTraceExporter: OTLPTraceExporterMock }));
        jest.doMock("@opentelemetry/exporter-metrics-otlp-proto", () => ({ OTLPMetricExporter: OTLPMetricExporterMock }));
        jest.doMock("@opentelemetry/sdk-metrics", () => ({ PeriodicExportingMetricReader: PeriodicExportingMetricReaderMock }));
        jest.doMock("@opentelemetry/baggage-span-processor", () => ({ ALLOW_ALL_BAGGAGE_KEYS: "ALL", BaggageSpanProcessor: BaggageSpanProcessorMock }));
        jest.doMock("@opentelemetry/sdk-trace-node", () => ({ BatchSpanProcessor: BatchSpanProcessorMock }));
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.resetModules();
        jest.clearAllMocks();
    });

    it("should not start SDK if OTEL_LOG_ENABLED is not 'true'", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "false";
        const logSpy = jest.spyOn(console, "log");
        require("../src/otel");
        expect(logSpy).not.toHaveBeenCalledWith("Staring OpenTelemetry SDK...");
        expect(NodeSDKMock).toHaveBeenCalled();
    });

    it("should start SDK and log if OTEL_LOG_ENABLED is 'true'", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
        process.env.OTEL_LOG_ENABLED = "true";
        const logSpy = jest.spyOn(console, "log");
        require("../src/otel");
        expect(logSpy).toHaveBeenCalledWith("Staring OpenTelemetry SDK...");
        expect(NodeSDKMock).toHaveBeenCalled();
    });

    it("should use the correct OTLP endpoint in exporters", () => {
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT = "http://test-endpoint";
        process.env.OTEL_LOG_ENABLED = "false";
        require("../src/otel");
        expect(OTLPTraceExporterMock).toHaveBeenCalledWith({ url: "http://test-endpoint/v1/traces", headers: {} });
        expect(OTLPMetricExporterMock).toHaveBeenCalledWith({ url: "http://test-endpoint/v1/metrics", headers: {} });
    });
});
