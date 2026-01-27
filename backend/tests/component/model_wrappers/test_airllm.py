from backend.Maia.hood.models.AirLLM.AirLLM import AirLLM


def test_airllm_chat():
    model = AirLLM()
    response = model.chat("Hello")
    print(response)



test_airllm_chat()