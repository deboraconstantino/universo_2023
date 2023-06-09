//------------------------------------------------------------------------------
/*/{Protheus.doc} universo
	Executa o App da demonstração do Universo.
	@type		function
	@author		TOTVS
	@since		08/06/2023
    @version    12.1.2210
/*/
//------------------------------------------------------------------------------
User Function universo()
	FwCallApp("universo_2023")
Return

Static Function JsToAdvpl(oWebChannel,cType,cContent)
    If cType == 'checkBalance'
        oWebChannel:AdvPLToJS('checkBalance', cValToChar(MostrarSaldo(cContent)))
	ElseIf cType == 'getParam'
		oWebChannel:AdvPLToJS('setParam', SuperGetMv(cContent))
    EndIf
Return

Static Function MostrarSaldo(cProduto)
	Local nSaldo := 0
	Local aArea := GetArea()
	Local aAreaSB2 := SB2->(GetArea())

	SB2->(dbSetOrder(1))
	If SB2->(dbSeek(xFilial("SB2") + cProduto))
		nSaldo := SaldoSB2()
	EndIf

	RestArea(aAreaSB2)
	RestArea(aArea)
Return nSaldo
